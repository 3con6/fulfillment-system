document.getElementById("topupMonney").addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent the form from being submitted through the default way

    const form = event.target; // Get the form element
    const platformSelect = document.getElementById("platform"); // Get the select element
    const currencySelect = document.getElementById("currency"); // Get the select element

    // Check if a valid option is selected in the select element
    if (platformSelect.value === "") {
        alert("Please select a platform."); // Show an error message to the user
        return; // Abort form submission
    }
    if (currencySelect.value === "") {
        alert("Please select a currency."); // Show an error message to the user
        return; // Abort form submission
    }

    const formData = new FormData(form); // Create a FormData object to collect form data

    const endpointUrl = "/api/topup";

    fetch(endpointUrl, {
        method: "POST",
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            // Handle the server response if needed
            // close modal and reload page
            $('#topupModal').modal('hide');
            location.reload();
        })
        .catch(error => {
            // Handle errors if there are any
            console.error("Error:", error);
        });
});