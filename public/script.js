document.getElementById('uploadForm').addEventListener('submit', async (event) => {
    event.preventDefault();
  
    const fileInput = document.getElementById('openapiFile');
    const resultDiv = document.getElementById('result');
    resultDiv.textContent = ''; // Clear previous result
  
    const file = fileInput.files[0];
    if (!file) {
      resultDiv.textContent = 'Please select a file.';
      return;
    }
  
    // Create FormData and append the file
    const formData = new FormData();
    formData.append('openapi', file);
  
    try {
      const response = await fetch('/upload', {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error('Failed to upload file.');
      }
  
      // Display the Swagger UI URL
      const url = await response.text();
      resultDiv.innerHTML = `<a href="${url}" target="_blank">View Swagger UI</a>`;
    } catch (error) {
      resultDiv.textContent = `Error: ${error.message}`;
    }
  });
  