const renderToolsItem = (data, inputValue) => {
    let count = 0;
    return (listTools = data.map((tool) => {
        return `<div class="d-flex align-items-center"><div class="user-info"><h6 class="mb-0"><a href="${tool.slug}">${tool.title}</a></h6></div></div>`;
    }));
};
$(document).ready(function () {
    // Select input element
    let input = $("#main-search");

    // Initialize timeout variable
    let timeout = null;

    // Attach event listener to input element
    input.on("focus keyup", function () {
        // event for search button
        if ($(this).val().length < 1) {
            $(".search-button").css("pointer-events", " none");
        } else {
            $(".search-button").css("pointer-events", " auto");
            $(".search-button").attr(
                "href",
                `/admin/admin_api_search=${$("#main-search").val()}`
            );
        }

        // Clear previous timeout
        clearTimeout(timeout);
        // Get input value
        let inputValue = input.val();

        if (inputValue.length > 0) {
            $(
                ".categories-result,.tools-result,.error-box,.top-cate, .maybe-result"
            ).hide();
            // temporarily js for hidden top-cate
            $(".result-container").show();
            $(".search-container").css("box-shadow", "none");
            $(".input-search").css("border", "1px solid transparent");

            $(".loading").show();
            // Start new timeout
            timeout = setTimeout(function () {
                // Send AJAX request to server
                $.ajax({
                    // url: "/api_search",
                    url: "/admin/admin_api_search",
                    type: "POST",
                    dataType: "json",
                    data: JSON.stringify({ query: inputValue }),
                    success: function (response) {
                        let totalTools = renderToolsItem(
                            response.res.post_data,
                            inputValue
                        );
                        // Handle response data
                        // logic for tool list
                        if (totalTools.length > 0) {
                            $(".tools-result").show();
                            $(".list-tool").html(totalTools.join(""));
                        } else {
                            $(".tools-result").hide();
                        }
                        if (
                            !totalTools.length > 0 &&
                            !totalTags.length > 0 &&
                            !totalMaybe.length > 0
                        ) {
                            $(".categories-result,.tools-result, maybe-result").hide();
                            $(".error-box").show();
                            $(".error-box").html(
                                `<div class="not-found px-3 py-2"><h6 class="suggestions-header text-primary mb-2">Pages</h6><p class="py-2 mb-0"><i class="bx bx-error-circle bx-xs me-2"></i> No Results Found</p></div>`
                            );
                        } else {
                            $(".error-box").hide();
                        }
                    },
                    complete: function () {
                        let tooltipTriggerList = [].slice.call(
                            document.querySelectorAll('[data-bs-toggle="tooltip"]')
                        );
                        let tooltipList = tooltipTriggerList.map(function (
                            tooltipTriggerEl
                        ) {
                            return new bootstrap.Tooltip(tooltipTriggerEl);
                        });
                    },
                    error: function (xhr, status, error) {
                        // Handle error
                        console.log("Error:", error);
                    },
                });
            }, 200);
        } else {
            $(".list-cate ,.tools-result,.error-box,.loading ,.maybe-result").hide();
            $(".categories-result, .top-cate").show();
            // temporarily js for hidden top-cate
            $(".result-container").hide();
            $(".input-search").css("border", "1px solid #9191e8");
        }
    });

    $(".readmore-button, .readless-button").on("click", function () {
        $(".tags-result").toggleClass("active");
    });
    if ($(".tags-result").height() > 100) {
        $(".readmore-button").show();
    } else {
        $(".readmore-button").hide();
    }
});
