/*****************************************************************************
 * FILE: mch_bridge MAIN JS
 * DATE: 03/16/22  
 * AUTHOR: Giovanni Romero
 * COPYRIGHT:
 * LICENSE:
 *****************************************************************************/

/*****************************************************************************
 *                      LIBRARY WRAPPER
 *****************************************************************************/

 var LIBRARY_OBJECT = (function() {
    // Wrap the library in a package function
    "use strict"; // And enable strict mode for this library

    /************************************************************************
     *                      MODULE LEVEL / GLOBAL VARIABLES
     *************************************************************************/
    var public_interface,
        map,
        markers = L.markerClusterGroup(),
        list_files,
        current_index_files=0;

    /************************************************************************
     *                    PRIVATE FUNCTION DECLARATIONS
     *************************************************************************/
    var getCookie,
        upload_data,
        upload_stngroups,
        upload_variablesTypesStn,
        initmap,
        preview_stations,
        validate_stations,
        arrayEquals,
        preview_stnGroups,
        map_to_graph,
        graph_something,
        preview_time_series;
		// Object returned by the module



    /************************************************************************
     *                    PRIVATE FUNCTION IMPLEMENTATIONS
     *************************************************************************/
    
    preview_time_series = function(){
        map_to_graph();
        var userFiles = document.getElementById("ts_csv").files;
        list_files =  Array.from(userFiles);
        console.log(userFiles);
        var userFile = userFiles[current_index_files];
        let dates = [];
        let values = [];

        let html_string = ''
        html_string += '</tr></thead><tbody>'
        dfd.readCSV(userFile).then((df) => {
            console.log(df);
            let date_index = df['$columns'].indexOf('Datee');
            let val_index = df['$columns'].indexOf('Valuee');
            if(date_index < 0 && val_index < 0 ){
                return // please provide the correct names to the Datee and Valuee columns
            }
            else{
                dates = df['$dataIncolumnFormat'][date_index]
                values = df['$dataIncolumnFormat'][val_index]
                graph_something(dates,values,userFile.name,"Valuee","Datee");
            }
            // create table dinamycally //
            // html_string = `<thead><tr>`
            // df['$columns'].forEach(function (item, index) {
            //     if(item != undefined){
            //         html_string +=`<th>${item}</th>`
            //     }
            // });
            // df['$data'].forEach(function (item, index) {

            //         html_string += '<tr>'
            //         item.forEach(function(value2){
            //             html_string += `<td>${value2}</td>`;
            //         })
            //         html_string += '</tr>';
            //   });
            // html_string += '</tbody>'
            // // // console.log(html_string);
            // $('#csv_table').html(html_string);

            // $('#csv_table').DataTable( {
            //     "scrollX": true
            // } );

        })
    }
    graph_something = function(dates,values,title_graph,x_axis,y_axis){


        var single_trace = {
            x: dates,
            y: values,
            mode: 'lines',
            name: 'Lines'
          };
          
          var data = [single_trace];
  
          
          var layout = {
            title: title_graph,
            xaxis: {
              title: x_axis
            },
            yaxis: {
              title: y_axis
            }
          };
          
          Plotly.newPlot('comodin__div', data, layout);
    }

     map_to_graph = function(){
        $("#map").hide();
        $("#next_plot").show();
        $("#last_plot").show();
        $("#comodin__div").show();
    }

    //Get a CSRF cookie for request
    getCookie = function(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    //find if method is csrf safe
    function csrfSafeMethod(method) {
        // these HTTP methods do not require CSRF protection
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }

    //add csrf token to appropriate ajax requests
    $(function() {
        $.ajaxSetup({
            beforeSend: function(xhr, settings) {
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", getCookie("csrftoken"));
                }
            }
        });
    }); //document ready


    arrayEquals = function (a, b) {
        return Array.isArray(a) &&
            Array.isArray(b) &&
            a.length === b.length &&
            a.every((val, index) => val === b[index]);
    }
    initmap = function(){
        map = L.map('map').setView([8.913648, -79.544706], 10);

        L.tileLayer('http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
            attribution: '©OpenStreetMap, ©CartoDB'
          }).addTo(map);
    }
    preview_stations = function(){
        
        let userFile = document.getElementById("stations_csv").files[0];
        let latlongs = []
        let html_string = ''
        html_string += '</tr></thead><tbody>'
        dfd.readCSV(userFile).then((df) => {
            console.log(df);
            // create table dinamycally //
            html_string = `<thead><tr>`
            df['$columns'].forEach(function (item, index) {
                if(item != undefined){
                    html_string +=`<th>${item}</th>`
                }
            })
            df['$data'].forEach(function (item, index) {
                if(item[8] != undefined && item[7] != undefined ){
                    console.log(typeof(item[8]), typeof(item[7]));
                    let marker = L.marker([parseFloat(item[8]), parseFloat(item[7])]).bindPopup(`${item[1]}`);
                    markers.addLayer(marker);
                    latlongs.push([parseFloat(item[8]), parseFloat(item[7])])
                    html_string += '<tr>'
                    item.forEach(function(value2){
                        html_string += `<td>${value2}</td>`;
                    })
                    html_string += '</tr>';
                }
              });
            html_string += '</tbody>'
            // console.log(html_string);
            $('#csv_table').html(html_string);
            map.addLayer(markers);
            var bounds = new L.LatLngBounds(latlongs);
            map.fitBounds(bounds);


            $('#csv_table').DataTable( {
                "scrollX": true
            } );

        })
    }
    validate_stations = function(){
        let warning_et = 'The File format is correct'
        let userFile = document.getElementById("stations_csv").files[0];
        let columns_check = [
            "Station",
            "StationName",
            "StationName2",
            "TimeZone",
            "Longitude",
            "Latitude",
            "Altitude",
            "Longitude2",
            "Latitude2",
            "DMSLongitude",
            "DMSLatitude",
            "Statee",
            "RegManagmt",
            "Catchment",
            "Subcatchment",
            "OperatnlRegion",
            "HydroReg",
            "RH",
            "Municipality",
            "CodeB",
            "CodeG",
            "CodeCB",
            "CodePB",
            "CodeE",
            "CodeCL",
            "CodeHG",
            "CodePG",
            "CodeNw",
            "Code1",
            "Code2",
            "Code3",
            "MaxOrdStrgLvl",
            "MaxOrdStrgVol",
            "MaxExtStrgLvl",
            "MaxExtStrgVol",
            "SpillwayLevel",
            "SpillwayStorage",
            "FreeSpillwayLevel",
            "FreeSpillwayStorage",
            "DeadStrgLevel",
            "DeadStrgCapac",
            "UsableStorageCapLev",
            "UsableStorage",
            "HoldingStorage",
            "Key1fil",
            "Key2fil",
            "Key3fil",
            "CritLevelSta",
            "MinLevelSta",
            "MaxLevelSta",
            "CritFlow",
            "MinDischarge",
            "MaxDischarge",
            "Stream",
            "Distance",
            "Infrastructure",
            "Type",
            "Usee"
        ]
        dfd.readCSV(userFile).then((df) => {   
            console.log(arrayEquals(columns_check, df['$columns']));
            if(df['$columns'].length < 0){
                warning_et = 'The CSV file is empty'
                $.notify(warning_et, "warn");
                return 
            }
            if(df['$columns'].length < 58 || df['$columns'].length > 58 ){
                warning_et = 'Check the number of columns. It should be 58'
                $.notify(warning_et, "warn");
                return 
            }
            if(!arrayEquals(columns_check, df['$columns'])){
                warning_et = 'The CSV file does not have the correct names in the columns. Please Check'
                $.notify(warning_et, "warn");
                return
            }
            $.notify(warning_et, "success");
            

        })
    }
    upload_data = function(type_upload){
        let formData = new FormData();
        let userFile;

        if(type_upload == 'stations'){
            userFile = document.getElementById("stations_csv").files[0];
            formData.append('csv_file', userFile);

        }
        if(type_upload == 'stngroups'){
            userFile = document.getElementById("stngroups_csv").files[0];
            formData.append('csv_file', userFile);

        }
        if(type_upload == 'variablestaiontype'){
            userFile = document.getElementById("variablestaiontype_csv").files[0];
            formData.append('csv_file', userFile);

        }
        if(type_upload == 'timeSeries'){
            $.each($("#ts_csv")[0].files, function(i, file) {
                console.log(file);
                formData.append("csv_file", file);
            });
            console.log(userFile);
        }
    

        formData.append('type_upload',type_upload);
        $.ajax({
            url: `upload-data/`,
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            dataType: 'json',
    
            // handle a successful response
            success: function (resp) {
                console.log(resp);
            },
    
            // handle a non-successful response
            error: function (xhr, errmsg, err) {
                // $('#raw_data_results').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: " + errmsg + ".</div>"); // add the error to the dom
               console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
            }
        });
    }
    preview_stnGroups = function(){
        $("#map").hide();
    }

    /************************************************************************
     *                        DEFINE PUBLIC INTERFACE
     *************************************************************************/

    public_interface = {

    };

    /************************************************************************
     *                  INITIALIZATION / CONSTRUCTOR
     *************************************************************************/

    // Initialization: jQuery function that gets called when
    // the DOM tree finishes loading

    $(function() {
        initmap();
        $("#last_plot").click(function(){
            current_index_files = current_index_files - 1;
            if(current_index_files < 0){
                current_index_files = 0;
            }
            preview_time_series();
        });
        $("#next_plot").click(function(){
            current_index_files = current_index_files + 1;
            if(current_index_files > (list_files.length -1) ){
                current_index_files = list_files.length -1;
            }
            preview_time_series();
        });
        
        $('#addStations').click(function() {
            $("#stations_modal").modal('show');
        })

        $('#addGroupsStations').click(function() {
            $("#stngroups_modal").modal('show');
        })

        $('#addVariablesStation').click(function() {
            $("#variableTypesStations_modal").modal('show');
        })
        $('#addTs').click(function() {
            console.log("jkoalsf");
            $("#ts_modal").modal('show');
        })

        $('#stations_csv_button').click(function() {
            upload_data("stations")
        })

        $('#stngroups_csv_button').click(function() {
            upload_data("stngroups")
        })
        $('#variabletypestn_csv_button').click(function() {
            upload_data("variablestationtype")
        })

        $('#ts_csv_button').click(function() {
            upload_data("timeSeries")
        })
        
       $("#stations_csv_button_preview").click(function() {
            preview_stations()
        })

        
        $("#stations_csv").change(function (evt) {
            evt.preventDefault();
            validate_stations();
        });

        $("#stngroups_csv_button_preview").click(function() {
            preview_stnGroups()
        })

        $("#ts_csv_button_preview").click(function() {
            preview_time_series();
            // graph_something();
        })
        $("#next_plot").click(function(){
            console.log(oye);
        })

    });




    return public_interface;


}());// End of package wrapper