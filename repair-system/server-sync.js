const fs = require('fs');
const path = require('path');

console.log('Server-sync script is running...');

// File to store or update with port information
const envFilePath = path.join(__dirname, 'client', '.env');

// Listen for server output to detect port
process.stdin.on('data', (data) => {
  const output = data.toString();
  const portMatch = output.match(/Server running at http:\/\/localhost:(\d+)/);
  
  if (portMatch && portMatch[1]) {
    const detectedPort = portMatch[1];
    console.log(`Server-sync: detected server running on port ${detectedPort}`);
    
    try {
      // Check if .env file exists
      if (fs.existsSync(envFilePath)) {
        // Read the file and check for VITE_API_URL
        const envContent = fs.readFileSync(envFilePath, 'utf8');
        const currentPort = envContent.match(/VITE_API_URL=http:\/\/localhost:(\d+)/);
        
        if (currentPort && currentPort[1] === detectedPort) {
          console.log('Server-sync: client .env already has correct port, skipping update');
        } else {
          // Update the port in the .env file
          const updatedContent = envContent.replace(
            /VITE_API_URL=http:\/\/localhost:\d+/,
            `VITE_API_URL=http://localhost:${detectedPort}`
          );
          
          fs.writeFileSync(envFilePath, updatedContent);
          console.log(`Server-sync: updated client .env with port ${detectedPort}`);
        }
      } else {
        // Create new .env file with the detected port
        fs.writeFileSync(envFilePath, `VITE_API_URL=http://localhost:${detectedPort}\n`);
        console.log(`Server-sync: created client .env with port ${detectedPort}`);
      }
    } catch (error) {
      console.error('Server-sync error:', error.message);
    }
  }
});

// Handle errors
process.stdin.on('error', (error) => {
  console.error('Server-sync stdin error:', error.message);
});

// Keep the process running
process.stdin.resume();