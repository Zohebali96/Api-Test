const API_KEY = '8b55130ca279a5ac25c7d4c890edb8a8';
const TASK_IDS_URL = 'https://demonstration.swiftcase.co.uk/362';
const SUBDOMAIN = 'https://demonstration.swiftcase.co.uk';

// Handle Request Function
async function handleRequest() {
    const errorMessage = document.getElementById('errorMessage');
    const productStatusId = document.getElementById('productStatusId').value.trim();

    if (!productStatusId) {
        errorMessage.textContent = 'Product Status ID is required.';
        return;
    }

    if (!Number.isInteger(Number(productStatusId))) {
        errorMessage.textContent = 'Product Status ID must be an integer.';
        return;
    }

    errorMessage.textContent = '';
    try {
        // Fetch task ids
        const taskIdsResponse = await fetch(`${TASK_IDS_URL}?statusId=${productStatusId}&apiKey=${API_KEY}`);
        if (!taskIdsResponse.ok) throw new Error('Failed to fetch task IDs');
        
        const taskIdsData = await taskIdsResponse.json();
        if (!taskIdsData.tasks || taskIdsData.tasks.length === 0) {
            document.getElementById('resultContent').textContent = 'No tasks found.';
            document.getElementById('resultModal').style.display = 'block';
            return;
        }

        // Fetch task details for each task id?
        const taskDetailsPromises = taskIdsData.tasks.map(taskId =>
            fetch(`https://${SUBDOMAIN}.swiftcase.co.uk/api/v2/${API_KEY}/status/${productStatusId}?taskId=${taskId}`)
                .then(response => response.json())
        );

        const taskDetails = await Promise.all(taskDetailsPromises);

        const results = taskDetails.map(task => ({
            ...task,
            date: Math.floor(new Date(task.date).getTime() / 1000)  // Converts date to Unix timestamp
        }));

        const totalCost = results
            .filter(task => task.Cancelled === "No")
            .reduce((sum, task) => sum + task.Cost, 0)
            .toFixed(2);

        const formattedCost = `£${totalCost}`;
        
        // Should display results in modal?
        document.getElementById('resultContent').textContent = `Total Cost: ${formattedCost}\n\nDetails:\n${JSON.stringify(results, null, 2)}`;
        document.getElementById('resultModal').style.display = 'block';

    } catch (error) {
        console.error('Error:', error);
        errorMessage.textContent = 'An error occurred while fetching data.';
    }
}

function closeModal() {
    document.getElementById('resultModal').style.display = 'none';
}

async function uploadFile() {
    const uploadMessage = document.getElementById('uploadMessage');
    const taskId = document.getElementById('taskId').value.trim();
    const fileInput = document.getElementById('fileInput').files[0];

    if (!taskId) {
        uploadMessage.textContent = 'Task ID is required.';
        return;
    }

    if (!fileInput) {
        uploadMessage.textContent = 'File is required.';
        return;
    }

    const formData = new FormData();
    formData.append('file', fileInput);

    try {
        // Request URL
        const url = `https://${SUBDOMAIN}.swiftcase.co.uk/api/v2/${API_KEY}/task/${taskId}/file`;

        // Requests the file
        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error('Failed to upload file');

        const result = await response.json();
        
        // Success Handler
        uploadMessage.textContent = `File uploaded successfully! Response: ${JSON.stringify(result, null, 2)}`;
    } catch (error) {
        console.error('Error:', error);
        uploadMessage.textContent = 'An error occurred while uploading the file.';
    }
}
