// Function to get URL parameters
function getUrlParameter(name) {
    const url = new URL(window.location.href);
    return url.searchParams.get(name);
}

function updateUrl(params) {
    const url = new URL(window.location);
    for (const [key, value] of Object.entries(params)) {
        if (value) {
            url.searchParams.set(key, value);
        } else {
            url.searchParams.delete(key);
        }
    }
    window.history.pushState({}, '', url);
}

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
    updateUrl({search: input});

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

        // Load the CSV file and populate the table
        loadCSV(() => {
            const searchParam = getUrlParameter('search');
            // If a search term is specified, trigger the search function
            if (searchParam) {
                document.getElementById('searchInput').value = searchParam;
                searchTable();
            }
        });
    });

// Function to load and display a selected CSV file
function loadCSV(callback) {
    let selectedFile = document.getElementById('csvSelect').value;

    // Update URL
    updateUrl({file: selectedFile});

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
            if (callback) {
                callback();
            }
        });
}

// Attach an event listener to the dropdown
document.getElementById('csvSelect').addEventListener('change', function() {
    loadCSV(() => {
        const searchParam = document.getElementById('searchInput').value;
        if (searchParam) {
            searchTable();
        }
    }); 
});

// Attach an event listener to the search input for 'Enter' key press
document.getElementById('searchInput').addEventListener('keydown', function(event) {
    if (event.key === "Enter") {
        searchTable();
    }
});

// Attach an event listener to the search button for clicks
document.getElementById('searchButton').addEventListener('click', function() {
    searchTable();
});

// Attach an event listener to the download button for clicks
document.getElementById('downloadLink').addEventListener('click', function() {
    let selectedFile = document.getElementById('csvSelect').value;
    let url = `data/${selectedFile}`;
    let a = document.createElement('a');
    a.href = url;
    a.download = selectedFile;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
});