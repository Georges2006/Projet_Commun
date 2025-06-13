async function fetchData() {
    try {
        const response = await fetch('../Controller/DataController.php');
            
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const result = await response.json();

        //Maj données
        const dataContainer = document.getElementById('data-container');
        const lastUpdate = document.getElementById('last-update');

        if (result.success) {
            dataContainer.innerHTML = result.data;
            dataContainer.style.color = 'black';
        } else {
            dataContainer.innerHTML = `Erreur : ${result.data}`;
            dataContainer.style.color = 'red';
        }
        
        lastUpdate.innerHTML = `Dernière mise à jour : ${result.timestamp}`;

    } catch (error) {
        document.getElementById('data-container').innerHTML = `Impossible de charger les données : ${error.message}`;
        document.getElementById('data-container').style.color = 'red';
    }
}

fetchData();    
setInterval(fetchData, 5000);