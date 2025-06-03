import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  PlusCircle,
  Search,
  Box,
  Tag,
  PackageOpen
} from "lucide-react";
import { getBrands, getModelsByBrand, getPartsByModel } from "@/api/catalog";
import { BrandType, ModelType, PartType } from "@/api/catalog";
import { useToast } from "@/hooks/useToast";

export function CatalogPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("brands");
  const [isLoading, setIsLoading] = useState(false);
  const [brands, setBrands] = useState<BrandType[]>([]);
  const [models, setModels] = useState<ModelType[]>([]);
  const [parts, setParts] = useState<PartType[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    setIsLoading(true);
    try {
      const { brands } = await getBrands();
      setBrands(brands);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch brands",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchModelsByBrand = async (brandId: string) => {
    setIsLoading(true);
    try {
      const { models } = await getModelsByBrand(brandId);
      setModels(models);
      setSelectedBrand(brandId);
      setSelectedModel(null);
      setParts([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch models",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPartsByModel = async (modelId: string) => {
    setIsLoading(true);
    try {
      const { parts } = await getPartsByModel(modelId);
      setParts(parts);
      setSelectedModel(modelId);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch parts",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBrands = brands.filter(brand => 
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredModels = models.filter(model => 
    model.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredParts = parts.filter(part => 
    part.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Catalog Management</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Item
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Catalog</CardTitle>
          <CardDescription>
            Browse and manage brands, models, and parts in the catalog
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-6">
            <Input
              placeholder="Search in catalog..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Button variant="outline" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </div>

          <Tabs defaultValue="brands" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="brands">
                <Tag className="mr-2 h-4 w-4" />
                Brands
              </TabsTrigger>
              <TabsTrigger value="models" disabled={!selectedBrand}>
                <Box className="mr-2 h-4 w-4" />
                Models
              </TabsTrigger>
              <TabsTrigger value="parts" disabled={!selectedModel}>
                <PackageOpen className="mr-2 h-4 w-4" />
                Parts
              </TabsTrigger>
            </TabsList>

            <TabsContent value="brands" className="border rounded-md p-4">
              {isLoading ? (
                <div className="flex justify-center p-4">Loading brands...</div>
              ) : filteredBrands.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No brands found.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBrands.map((brand) => (
                      <TableRow key={brand._id}>
                        <TableCell>
                          <div className="flex items-center">
                            {brand.imageUrl && (
                              <img
                                src={brand.imageUrl}
                                alt={brand.name}
                                className="h-8 w-8 mr-2 rounded-full object-cover"
                              />
                            )}
                            <span>{brand.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            brand.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {brand.active ? 'Active' : 'Inactive'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              fetchModelsByBrand(brand._id);
                              setActiveTab("models");
                            }}
                          >
                            View Models
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="models" className="border rounded-md p-4">
              {!selectedBrand ? (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">Please select a brand first.</p>
                </div>
              ) : isLoading ? (
                <div className="flex justify-center p-4">Loading models...</div>
              ) : filteredModels.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No models found for this brand.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredModels.map((model) => (
                      <TableRow key={model._id}>
                        <TableCell>
                          <div className="flex items-center">
                            {model.imageUrl && (
                              <img
                                src={model.imageUrl}
                                alt={model.name}
                                className="h-8 w-8 mr-2 rounded-full object-cover"
                              />
                            )}
                            <span>{model.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {brands.find(b => b._id === model.brandId)?.name || model.brandId}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            model.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {model.active ? 'Active' : 'Inactive'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              fetchPartsByModel(model._id);
                              setActiveTab("parts");
                            }}
                          >
                            View Parts
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="parts" className="border rounded-md p-4">
              {!selectedModel ? (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">Please select a model first.</p>
                </div>
              ) : isLoading ? (
                <div className="flex justify-center p-4">Loading parts...</div>
              ) : filteredParts.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No parts found for this model.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredParts.map((part) => (
                      <TableRow key={part._id}>
                        <TableCell>{part.name}</TableCell>
                        <TableCell>${part.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <span className={`${
                            part.stock > 10 ? 'text-green-600' : part.stock > 0 ? 'text-amber-600' : 'text-red-600'
                          } font-medium`}>
                            {part.stock}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            part.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {part.active ? 'Active' : 'Inactive'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}