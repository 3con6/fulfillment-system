/**
 * File Upload
 */

'use strict';

(function () {
    // previewTemplate: Updated Dropzone default previewTemplate
    // ! Don't change it unless you really know what you are doing
    const previewTemplate = `<div class="dz-preview dz-file-preview">
    <div class="dz-details">
        <div class="dz-thumbnail">
            <img data-dz-thumbnail>
            <span class="dz-nopreview">No preview</span>
            <div class="dz-success-mark"></div>
            <div class="dz-error-mark"></div>
            <div class="dz-error-message"><span data-dz-errormessage></span></div>
            <div class="progress">
            <div class="progress-bar progress-bar-primary" role="progressbar" aria-valuemin="0" aria-valuemax="100" data-dz-uploadprogress></div>
            </div>
        </div>
        <div class="dz-filename" data-dz-name></div>
        <div class="dz-size" data-dz-size></div>
        </div>
    </div>`;

    // ? Start your code from here

    // Basic Dropzone
    // --------------------------------------------------------------------
    const dropzoneBasic = document.querySelector('#dropzone-basic');
    if (dropzoneBasic) {
        const myDropzone = new Dropzone(dropzoneBasic, {
            previewTemplate: previewTemplate,
            parallelUploads: 1,
            maxFilesize: 70,
            addRemoveLinks: true,
            maxFiles: 1
        });
    }

    // Multiple Dropzone
    // --------------------------------------------------------------------
    const dropzoneMulti = document.querySelector('#dropzone-multi');
    const dropzoneMulti2 = document.querySelector('#dropzone-multi-2');
    if (dropzoneMulti) {
        const myDropzoneMulti = new Dropzone(dropzoneMulti, {
            url: '/dummy-url', // Set a dummy URL to prevent Dropzone from handling the upload
            previewTemplate: previewTemplate,
            parallelUploads: 1,
            maxFilesize: 70,
            addRemoveLinks: true
        });

        const uploadBtn = document.getElementById('uploadBtn');
        uploadBtn.addEventListener('click', function () {
            const files = myDropzoneMulti.files;
            if (files.length > 0) {
                handleFormSubmit(files);
            } else {
                console.log('No files selected.');
            }
        });
    };
    if (dropzoneMulti2) {
        const myDropzoneMulti = new Dropzone(dropzoneMulti2, {
            url: '/dummy-url', // Set a dummy URL to prevent Dropzone from handling the upload
            previewTemplate: previewTemplate,
            parallelUploads: 1,
            maxFilesize: 70,
            addRemoveLinks: true
        });

        const uploadBtnReuse = document.getElementById('uploadBtnReuse');
        uploadBtnReuse.addEventListener('click', function () {
            const files = myDropzoneMulti.files;
            if (files.length > 0) {
                handleFormSubmitReuse(files);
            } else {
                console.log('No files selected.');
            }
        });
    };
})();

function handleFormSubmit(files) {
    const formData = new FormData();
    const order_id = document.getElementById('order_id').value;
    const product_id = document.getElementById('product_id').value;
    const line_item_id = document.getElementById('line_item_id').value;
    const shop = document.getElementById('shop').value;
    const seller = document.getElementById('seller').value;
    const order_date = document.getElementById('order_date').value;
    formData.append('order_id', order_id); 
    formData.append('product_id', product_id); 
    formData.append('line_item_id', line_item_id); 
    formData.append('shop', shop); 
    formData.append('seller', seller); 
    formData.append('order_date', order_date); 

    // Append each file to the formData
    files.forEach((file, index) => {
        formData.append(`file_${index}`, file);
    });

    const apiEndpoint = '/api/upload_order_design';

    fetch(apiEndpoint, {
        method: 'POST',
        body: formData,
    })
        .then((response) => response.json())
        .then((data) => {
            // Hide the modal popup
            alert(data.message);

            $('#uploadOrderDesign').modal('hide');
            // Refresh the page
            location.reload();
        })
        .catch((error) => {
            // Handle errors here
            alert(data.message);
        });
};
function handleFormSubmitReuse(files) {
    const formData = new FormData();
    const order_id = document.getElementById('order_id_2').value;
    const product_id = document.getElementById('product_id_2').value;
    const sku = document.getElementById('sku').value;
    formData.append('order_id', order_id); 
    formData.append('product_id', product_id); 
    formData.append('sku', sku);

    // Append each file to the formData
    files.forEach((file, index) => {
        formData.append(`file_${index}`, file);
    });

    const apiEndpoint = '/api/upload_order_design_reuse';

    fetch(apiEndpoint, {
        method: 'POST',
        body: formData,
    })
        .then((response) => response.json())
        .then((data) => {
            // Hide the modal popup
            alert(data.message);

            $('#uploadOrderDesignReuse').modal('hide');
            // Refresh the page
            location.reload();
        })
        .catch((error) => {
            // Handle errors here
            alert(data.message);
        });
};

function uploadOrderDesign(team, order_id, product_id, shop, seller, order_date) {
    const hiddenTeam = document.getElementById('team');
    const hiddenOrder = document.getElementById('order_id');
    const hiddenProduct = document.getElementById('product_id');
    const shopName = document.getElementById('shop');
    const sellerId = document.getElementById('seller');
    const orderDate = document.getElementById('order_date');
    let showModal = true; // Initialize the flag

    // Edit hidden input value
    hiddenTeam.value = team;
    hiddenOrder.value = order_id;
    hiddenProduct.value = product_id;
    shopName.value = shop;
    sellerId.value = seller;
    orderDate.value = order_date;

    // Check if any of the fields is empty
    if (shopName.value == '' || sellerId.value == '' || orderDate.value == '') {
        showModal = false; // Set the flag to false if there's an error
        alert('Please fill in all fields');
    }

    // Show the modal popup only if the flag is true
    if (showModal) {
        const modalElement = document.getElementById('uploadOrderDesign');
        const modalInstance = new bootstrap.Modal(modalElement);
        modalInstance.show();
    }
}

function uploadOrderDesignReuse(order_id, product_id, sku) {
    console.log(order_id, product_id, sku, '------------------');
    const hiddenOrder = document.getElementById('order_id_2');
    const hiddenProduct = document.getElementById('product_id_2');
    const hiddenSku = document.getElementById('sku');
    let showModal = true; // Initialize the flag

    // Edit hidden input value
    hiddenOrder.value = order_id;
    hiddenProduct.value = product_id;
    hiddenSku.value = sku;

    // Check if any of the fields is empty
    if (hiddenSku.value == '' || hiddenProduct.value == '' || hiddenSku.value == '') {
        showModal = false; // Set the flag to false if there's an error
        alert('Please fill in all fields');
    }

    // Show the modal popup only if the flag is true
    if (showModal) {
        const modalElement = document.getElementById('uploadOrderDesignReuse');
        const modalInstance = new bootstrap.Modal(modalElement);
        modalInstance.show();
    }
}