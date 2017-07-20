function clear_results() {
    $("#search_results").fadeOut("slow");
    $("#search_results").empty();
}


function generate_table(mass, ionisation, api_url, tolerance) {

    function insert_table(mass) {
        var mass_table = "<table id='results_" + mass.replace(".", "_") + "' class='table table-striped table-responsive display' width='100%'><thead>" +
            "<tr></tr></thead></table>";
        return mass_table
    }

    function generate_datatable(mass, ionisation, api_url) {
        $('#results_' + mass.replace(".", "_") + '').DataTable({
            "destroy": true,
            "searching": false,
            "lengthChange": false,
            "pageLength": 5,
            "ajax": {
                "url": encodeURI(api_url),
                "dataSrc": "_items"
            },
            "columns": [
                {
                    "title": "Metabolite Name",
                    "width": "40%",
                    "data": "Name",
                    "render": function (data, type, row) {
                        return "<a href='" + getBaseURL() + "view/" + row._id + "' target='_blank'>" + data + "</a>"
                    }
                },
                {
                    "title": "Molecular Formula",
                    "width": "10%",
                    "className": "dt-center",
                    "data": "Molecular Formula",
                    "render": function (data, type, row) {
                        return data;
                    }
                },
                {
                    "title": "Mass (m/z)",
                    "data": "Adducts",
                    "className": "dt-center",
                    "width": "10%",
                    "render": function (data, type, row) {
                        return data[ionisation][0]["accurate_mass"].toFixed(3);
                    }
                },
                {
                    "title": "Adduct",
                    "data": "Adducts",
                    "className": "dt-center",
                    "width": "10%",
                    "render": function (data, type, row) {
                        return data[ionisation][0]["type"];
                    }
                },
                {
                    "title": "Delta",
                    "data": "Adducts",
                    "className": "dt-center",
                    "width": "10%",
                    "render": function (data, type, row) {
                        return (data[ionisation][0]["accurate_mass"] - mass).toFixed(3);
                    }
                }
            ],
        });
    }



    $("#search_results").append("<h3> " + mass +" m/z</h3>");
    $("#search_results").append(insert_table(mass));
    generate_datatable(mass, ionisation, api_url);
}

function generate_api_url(mass, ionisation) {

    function generate_adducts() {
        var adducts = [];
        $('#ionisation_adducts').find(":selected").each(function () {
            adducts.push($(this).val());
        });
        return JSON.stringify(adducts)
    }

    var tolerance = $("#search_tolerance").val();


    var api_url = getBaseURL() + "api/metabolites/?where={";

    api_url += '"Adducts.' + ionisation + '" : {"$elemMatch" : {"type" : {"$in" : ' + generate_adducts() + '},';


    var lte = parseFloat(mass) + parseFloat(tolerance);
    var gte = parseFloat(mass) - parseFloat(tolerance);


    api_url += '"accurate_mass" : {"$lte" : ' + lte + ', "$gte" : ' + gte + '}}}';


    api_url += '}&projection={"Name" : 1, "Molecular Formula" : 1, "Adducts.' + ionisation + '.$":1}&max_results=1000}';

    console.log(api_url);

    return [api_url, tolerance];
}

$("#search_button").click(function () {
    clear_results();
    var masses = $("#masses").tagsinput("items");
    var ionisation = $("input[type=radio][name=ionisation]:checked").val();
    masses.forEach(function (mass, index) {
        var mass = mass.trim();
        var info = generate_api_url(mass, ionisation);
        generate_table(mass, ionisation, info[0], info[1]);
    });

    $("#search_results").fadeIn("slow");
});


$(document).ready(function () {

    $('#search_results').on('click', "#add_to_clipboard", function () {
        clipboard_hook($(this).attr("name"));
    });

    function fill_adducts_list(ionisation) {
        var adducts_dict = {
            "Negative": [
                ["[M-H]1-", 1],
                ["[M+Cl]1-", 1],
                ["[M+Br]1-", 1],
                ["[M+Na-2H]1-", 0],
                ["[M+K-2H]1-", 0],
                ["[3M-H]1-", 0],
                ["[2M+Hac-H]1-", 0],
                ["[2M+FA-H]1-", 0],
                ["[2M-H]1-", 0],
                ["[M+TFA-H]1-", 0],
                ["[M+Hac-H]1-", 0],
                ["[M+FA-H]1-", 0],
                ["[M-2H]2-", 0],
                ["[M-3H]3-", 0],
                ["[2M+Na-2H]1-", 0],
                ["[M1-.]1-", 0]
            ],
            "Positive": [
                ["[M+H]1+", 1]
            ],
            "Neutral": [
                ["[M]", 1]
            ]
        };

        $("#ionisation_adducts").empty();

        adducts_dict[ionisation].forEach(function (adduct, index) {
            if (adduct[1] == 1) {
                $("#ionisation_adducts").append($("<option selected></option>").text(adduct[0]).attr("value", adduct[0]));
            }
            else {
                $("#ionisation_adducts").append($("<option></option>").text(adduct[0]).attr("value", adduct[0]));
            }
        });


    }

    $("input[type=radio][name=ionisation]").change(function () {
        fill_adducts_list(this.value)
    });


});

