// CSV Parsing Function
function parseCSV(text) {
    let lines = text.split('\n');
    let result = [];
    let headers = lines[0].split(',');

    for(let i = 1; i < lines.length; i++) {
        let obj = {};
        let currentline = lines[i].split(',');
        let j = 0, temp = '';

        for (let cell of currentline) {
            if (cell.startsWith('"') && !cell.endsWith('"')) {
                temp = cell;
            } else if (!cell.startsWith('"') && cell.endsWith('"')) {
                temp += ',' + cell;
                obj[headers[j]] = temp.slice(1, -1);
                temp = '';
                j++;
            } else if (temp !== '') {
                temp += ',' + cell;
            } else {
                obj[headers[j]] = cell;
                j++;
            }
        }

        result.push(obj);
    }
    return result;
}

// Implement search functionality
function searchTable() {
    const input = document.getElementById('searchInput').value.toLowerCase();
    const table = document.getElementById('dataTable');
    const rows = table.getElementsByTagName('tr');

    for (let i = 1; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName('td');
        let match = false;

        for (const cell of cells) {
            const text = cell.textContent.toLowerCase();
            if (text.includes(input)) {
                match = true;
                break;
            }
        }

        rows[i].style.display = match ? '' : 'none';
    }
}

// Fetch the list of available CSV files from fileList.json
fetch('data/fileList.json')
    .then(response => response.json())
    .then(data => {
        const select = document.getElementById('csvSelect');
        for (const file of data.files) {
            const option = document.createElement('option');
            option.value = file;
            option.textContent = file;
            select.appendChild(option);
        }
        loadCSV(); // Load the first CSV by default
    });

// Function to load and display a selected CSV file
function loadCSV() {
    const selectedFile = document.getElementById('csvSelect').value;
    document.getElementById('downloadLink').href = `data/${selectedFile}`;
    document.getElementById('downloadLink').textContent = `Download CSV`;

    fetch(`data/${selectedFile}`)
        .then(response => response.text())
        .then(data => {
            const parsedData = parseCSV(data);
            const table = document.getElementById('tableBody');
            table.innerHTML = ''; // Clear existing rows

            for (const row of parsedData) {
                const tr = document.createElement('tr');
                for (const [key, value] of Object.entries(row)) {
                    const td = document.createElement('td');
                    td.textContent = value;
                    tr.appendChild(td);
                }
                table.appendChild(tr);
            }
        });
}