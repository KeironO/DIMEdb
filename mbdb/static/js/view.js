// Need to write a API handler to retrieve all data.

function render_view(base_url, id) {
    var url = base_url + "api/metabolite/?id__exact=" + id;

    var x_plot = [];
    var y_plot = [];

    $.getJSON(url, function (data) {
        var metabolite = data["data"][0];
        console.log(metabolite);



        // Change the document title.
        $(document).prop('title', metabolite["name"] + " : Metabolite DataBase");
        $("#name").html(metabolite["name"]);
        $("#molecular_formula").html(metabolite["molecular_formula"].replace(/([0-9]+)/g, '<sub>$1</sub>'));
        $("#accurate_mass").html(metabolite["accurate_mass"]);
        $("#neutral_mass").html(metabolite["adduct_weights"]["neutral"]);
        $("#origins").html(metabolite["origins"]);
        $("#smiles").html(metabolite["smiles"]);
        $.ajax({
            url: base_url+"gen_structure/"+metabolite["id"],
            success: function (result) {
                console.log(result);
                $("#structure").attr("src", "data:image/png;base64,"+result);
            }
        });
        for (i in metabolite["isotopic_distributions"]) {
            var spectra = metabolite["isotopic_distributions"][i];
            x_plot.push(spectra[0] + metabolite["adduct_weights"]["neutral"]);
            y_plot.push(spectra[1]);
        }


        var isotopic_data = [{
            x: x_plot,
            y: y_plot,
            type: 'bar',
            width : 0.5,
        }];

        var layout = {
            xaxis: {
                title: 'mass-to-ion (mz)',
                showgrid: false,
                zeroline: false
            },
            yaxis: {
                title: 'relative abundance (%)',
                showline: false
            },
            margin: {
                l: 50,
                r: 50,
                b: 50,
                t: 50,
                pad: 4
            }
        };

        Plotly.newPlot("distribution_chart", isotopic_data, layout)
    });


}