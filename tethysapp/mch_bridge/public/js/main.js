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
        current_index_files=0,
        isMapShowing=false,
        isGraphsShowing= false;

    /************************************************************************
     *                    PRIVATE FUNCTION DECLARATIONS
     *************************************************************************/
    var getCookie,
        upload_data,
        initmap,
        preview_stations,
        validate_stations,
        arrayEquals,
        preview_stnGroups,
        only_tables,
        map_to_graph,
        graph_to_map,
        graph_something,
        preview_time_series,
        // preview_variabletypestn,
        startWS,
        sendNotification,
        notification_ws;
		// Object returned by the module



    /************************************************************************
     *                    PRIVATE FUNCTION IMPLEMENTATIONS
     *************************************************************************/
     sendNotification = function (message, n_content){
        // let new_element = `<div style="display: none;" id="install_notif_${notifCount}">${message}</div>`
        if (message == "Upload complete") {
            console.log('complete');
            // new_element = `<div style="display: none;" id="install_notif_${notifCount}">Install Complete. Restarting Server for changes to take effect.</div>`
            // notification_ws.send(
            //     JSON.stringify({
            //         data: { ...installData, restart_type: "install" },
            //         type: `restart_server`
            //     })
            // )
            // resetInstallStatus()
        }
        if (message == "Uploading in process...") {
            console.log('in process...');
        //    notification_ws.send(
        //         JSON.stringify({
        //             data: { ...uninstallData, restart_type: "uninstall" },
        //             type: `restart_server`
        //         })
        //     )
        }
        if(message == "Uploading failed"){
            console.log('failed');

        }
        // n_content.append(new_element)
        // $(`#install_notif_${notifCount}`).show("fast")
    }
    startWS =  function(websocketServerLocation){
        notification_ws = new WebSocket(websocketServerLocation)
        notification_ws.onopen = () => {
            console.log("WebSocket is Open")

        }
    
        notification_ws.onmessage = function(e) {
            let data = JSON.parse(e.data)
            console.log(data)
            var html_string = '';
            
            var count_rows = data['count'];
            var name_file = data['file'];
            var id_file = data['id'];
            var total_count = data['total'];
            var mssge = data['mssg'];


            $(`#${id_file}`).empty();
            html_string = `
                <td>${name_file}</td>
                <td>${count_rows}/${total_count}</td>`
            if(data.status == "Failed"){
                html_string += `<td> <i class="fa-solid fa-circle-xmark imcomplete"></i></td>`
                $.notify(mssge , "info");

            }
            if(data.status == "complete"){
                html_string += `<td> <i class="fa-solid fa-circle-check complete"></i></td>`
            }
            if(data.status == "in process"){
                html_string += `<td> <i class="fas fa-sync fa-spin process"></i></td>`
            }
            $(html_string).appendTo(`#${id_file}`);

            // if(data.status == "Failed"){
            //     console.log("failed");
            //     var html_string = '';
            //     var count_rows = data['count'];
            //     var name_file = data['file'];
            //     var id_file = data['id'];
            //     var total_count = data['total'];
            //     $(`#${id_file}`).empty();
            //     html_string = `
            //         <td>${name_file}</td>
            //         <td>${count_rows}/${total_count}</td>
            //         <td> <i class="fa-solid fa-circle-xmark imcomplete"></i></td>
            //     `
            //     $(html_string).appendTo(`#${id_file}`);
            // }
            // if(data.status == "complete"){
            //     console.log("success");
            //     var html_string = '';
            //     var count_rows = data['count'];
            //     var name_file = data['file'];
            //     var id_file = data['id'];
            //     var total_count = data['total'];

            //     $(`#${id_file}`).empty();

            //     html_string = `
            //         <td>${name_file}</td>
            //         <td>${count_rows}/${total_count}</td>
            //         <td> <i class="fa-solid fa-circle-check complete"></i></td>
            //     `
            //     $(html_string).appendTo(`#${id_file}`);
            // }
            // if(data.status == "in process"){
            //     console.log("processing");
            //     var html_string = '';
            //     var count_rows = data['count'];
            //     var name_file = data['file'];
            //     var id_file = data['id'];
            //     var total_count = data['total'];

            //     $(`#${id_file}`).empty();

            //     html_string = `
            //         <td>${name_file}</td>
            //         <td>${count_rows}/${total_count}</td>
            //         <td> <i class="fa-solid fa-circle-check complete"></i></td>
            //     `
            //     $(html_string).appendTo(`#${id_file}`);

            // }


        }
    
        notification_ws.onclose = function() {
            // setServerOffline()
            // Try to reconnect in 1 second
            setTimeout(function() {
                startWS(websocketServerLocation)
            }, 1000)
            console.log("WebSocket is Closed")

        }
    }
    preview_time_series = function(){
        map_to_graph();
        $('#comodin__div').empty();

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
                $.notify( "Please, the columns containing the date and values should be called Datee and Valuee columns", "warn");

                return // please provide the correct names to the Datee and Valuee columns
            }
            else{
                dates = df['$dataIncolumnFormat'][date_index]
                values = df['$dataIncolumnFormat'][val_index]
                graph_something(dates,values,userFile.name,"Datee","Valuee");
            }

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
    // only_tables = function(){
    //     $("#map").hide();
    //     isMapShowing = false;
    //     markers = L.markerClusterGroup();
    //     $("#next_plot").hide();
    //     $("#last_plot").hide();
    //     $("#comodin__div").show();
    //     isGraphsShowing = true;
    //     $("#instructions").hide();

    //     $('#show_instructions').prop('checked', false);    
    // }
     map_to_graph = function(){
        $("#map").hide();
        isMapShowing = false;
        markers = L.markerClusterGroup();
        $("#next_plot").show();
        $("#last_plot").show();
        $("#comodin__div").show();
        isGraphsShowing = true;
        $("#instructions").hide();

        $('#show_instructions').prop('checked', false);
    }

    graph_to_map = function(){
        // $("#map").show();
        // map.invalidateSize();
        isGraphsShowing = false;
        isMapShowing = true;
        $("#instructions").hide();
        $("#next_plot").hide();
        $("#last_plot").hide();
        // $("#comodin__div").show();
        list_files = [];
        current_index_files=0;
        $('#show_instructions').prop('checked', false);
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
        map = L.map('map').setView([8.913648, -79.544706], 15);

        L.tileLayer('http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
            attribution: '©OpenStreetMap, ©CartoDB'
          }).addTo(map);
    }
    // preview_stations = function(){
    //     graph_to_map();
    //     $('#comodin__div').empty();
    //     let userFile = document.getElementById("stations_csv").files[0];
    //     let latlongs = []

    //     dfd.readCSV(userFile).then((df) => {
    //         console.log(df);

    //         df['$data'].forEach(function (item, index) {
    //             if(item[8] != undefined && item[7] != undefined ){
    //                 console.log(typeof(item[8]), typeof(item[7]));
    //                 let marker = L.marker([parseFloat(item[8]), parseFloat(item[7])]).bindPopup(`${item[1]}`);
    //                 markers.addLayer(marker);
    //                 latlongs.push([parseFloat(item[8]), parseFloat(item[7])])

    //             }
    //           });

    //         map.addLayer(markers);
    //         var bounds = new L.LatLngBounds(latlongs);
    //         map.fitBounds(bounds);

    //     })
    // }
    // validate_stations = function(){
    //     let warning_et = 'The File format is correct'
    //     let userFile = document.getElementById("stations_csv").files[0];
    //     let columns_check = [
    //         "Station",
    //         "StationName",
    //         "StationName2",
    //         "TimeZone",
    //         "Longitude",
    //         "Latitude",
    //         "Altitude",
    //         "Longitude2",
    //         "Latitude2",
    //         "DMSLongitude",
    //         "DMSLatitude",
    //         "Statee",
    //         "RegManagmt",
    //         "Catchment",
    //         "Subcatchment",
    //         "OperatnlRegion",
    //         "HydroReg",
    //         "RH",
    //         "Municipality",
    //         "CodeB",
    //         "CodeG",
    //         "CodeCB",
    //         "CodePB",
    //         "CodeE",
    //         "CodeCL",
    //         "CodeHG",
    //         "CodePG",
    //         "CodeNw",
    //         "Code1",
    //         "Code2",
    //         "Code3",
    //         "MaxOrdStrgLvl",
    //         "MaxOrdStrgVol",
    //         "MaxExtStrgLvl",
    //         "MaxExtStrgVol",
    //         "SpillwayLevel",
    //         "SpillwayStorage",
    //         "FreeSpillwayLevel",
    //         "FreeSpillwayStorage",
    //         "DeadStrgLevel",
    //         "DeadStrgCapac",
    //         "UsableStorageCapLev",
    //         "UsableStorage",
    //         "HoldingStorage",
    //         "Key1fil",
    //         "Key2fil",
    //         "Key3fil",
    //         "CritLevelSta",
    //         "MinLevelSta",
    //         "MaxLevelSta",
    //         "CritFlow",
    //         "MinDischarge",
    //         "MaxDischarge",
    //         "Stream",
    //         "Distance",
    //         "Infrastructure",
    //         "Type",
    //         "Usee"
    //     ]
    //     dfd.readCSV(userFile).then((df) => {   
    //         console.log(arrayEquals(columns_check, df['$columns']));
    //         if(df['$columns'].length < 0){
    //             warning_et = 'The CSV file is empty'
    //             $.notify(warning_et, "warn");
    //             return 
    //         }
    //         if(df['$columns'].length < 58 || df['$columns'].length > 58 ){
    //             warning_et = 'Check the number of columns. It should be 58'
    //             $.notify(warning_et, "warn");
    //             return 
    //         }
    //         if(!arrayEquals(columns_check, df['$columns'])){
    //             warning_et = 'The CSV file does not have the correct names in the columns. Please Check'
    //             $.notify(warning_et, "warn");
    //             return
    //         }
    //         $.notify(warning_et, "success");
            

    //     })
    // }
    upload_data = function(type_upload){
        let formData = new FormData();
        let userFile;
        let files_list = [];

        if(type_upload == 'stations'){
            userFile = document.getElementById("stations_csv_upload").files[0];
            formData.append('csv_file', userFile);
            files_list.push(userFile['name'])

        }
        if(type_upload == 'stngroups'){
            userFile = document.getElementById("groupStations_csv_upload").files[0];
            formData.append('csv_file', userFile);
            files_list.push(userFile['name'])


        }
        if(type_upload == 'variablestationtype'){
            userFile = document.getElementById("variableStationTypes_csv_upload").files[0];
            formData.append('csv_file', userFile);
            files_list.push(userFile['name'])


        }
        if(type_upload == 'timeSeries'){
            $.each($("#ts_csv_upload")[0].files, function(i, file) {
                console.log(file);
                formData.append("csv_file", file);
                files_list.push(file['name'])

            });
            console.log(userFile);
        }
    

        formData.append('type_upload',type_upload);
        formData.append('type','upload__data');
        for(var pair of formData.entries()) {
            console.log(pair[0]+', '+pair[1]);
        }

        $.ajax({
            url: `upload-files/`,
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            dataType: 'json',
    
            // handle a successful response
            success: function (resp) {
                // $.notify( "Data is being loaded into database", "success");
                // startWS(ws_url);

                console.log(resp);
                var data_list = resp['data']
                // $('#map').css('margin-bottom', '300px');
                // map.invalidateSize();
                // $("#comodin__div").show();
                // $('#sidebar').css('z-index', '2');
                var html_string = '';
                var id_lists = []
                data_list.forEach(function(item_){
                    var count_rows = item_['count'];
                    var name_file = item_['file'];
                    var id_html = item_['id'];
                    id_lists.push(id_html);
                    html_string += `<tr id=${id_html}>
                        <td>${name_file}</td>
                        <td>0/${count_rows}</td>
                        <td> <i class="fas fa-sync fa-spin process"></i></i></td>
                    </tr>`
                })
                // if(type_upload == 'stations'){
                //     $(html_string).appendTo(`#${type_upload}_table_content`);
                // }
                
                // if(type_upload == 'stngroups'){
                //     $(html_string).appendTo(`#${type_upload}_table_content`);
                // }
                $(html_string).appendTo(`#${type_upload}_table_content`);

                notification_ws.send(
                    JSON.stringify({
                        'type':'upload__data',
                        'type_upload': type_upload,
                        'csv_file':files_list,
                        'id':id_lists
                    })
                )

        
            },
    
            // handle a non-successful response
            error: function (xhr, errmsg, err) {
                $.notify( `${xhr.responseText}`, "error");

                // $('#raw_data_results').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: " + errmsg + ".</div>"); // add the error to the dom
               console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
            }
        });
    }
    // preview_stnGroups = function(){
    //     only_tables();
    //     $('#comodin__div').empty();

    //     var userFile = document.getElementById("stngroups_csv").files[0];
    //     let html_string = '<table id="csv_table" class="display nowrap" style="width:100%"> </table>'
    //     $('#comodin__div').html(html_string);

    //     html_string += '</tr></thead><tbody>'
    //     dfd.readCSV(userFile).then((df) => {

    //         // create table dinamycally
    //         html_string = `<thead><tr>`
    //         df['$columns'].forEach(function (item, index) {
    //             if(item != undefined){
    //                 html_string +=`<th>${item}</th>`
    //             }
    //         });
    //         df['$data'].forEach(function (item, index) {

    //                 html_string += '<tr>'
    //                 item.forEach(function(value2){
    //                     html_string += `<td>${value2}</td>`;
    //                 })
    //                 html_string += '</tr>';
    //           });
    //         html_string += '</tbody>'
    //         // // console.log(html_string);
    //         $('#csv_table').html(html_string);

    //         $('#csv_table').DataTable( {
    //             "scrollX": true
    //         } );

    //     })
    // }
    // preview_variabletypestn = function(){
    //     only_tables();
    //     $('#comodin__div').empty();

    //     var userFile = document.getElementById("variabletypestn_csv").files[0];
    //     let html_string = '<table id="csv_table" class="display nowrap" style="width:100%"> </table>'
    //     $('#comodin__div').html(html_string);

    //     html_string += '</tr></thead><tbody>'
    //     dfd.readCSV(userFile).then((df) => {

    //         // create table dinamycally
    //         html_string = `<thead><tr>`
    //         df['$columns'].forEach(function (item, index) {
    //             if(item != undefined){
    //                 html_string +=`<th>${item}</th>`
    //             }
    //         });
    //         df['$data'].forEach(function (item, index) {

    //                 html_string += '<tr>'
    //                 item.forEach(function(value2){
    //                     html_string += `<td>${value2}</td>`;
    //                 })
    //                 html_string += '</tr>';
    //           });
    //         html_string += '</tbody>'
    //         $('#csv_table').html(html_string);

    //         $('#csv_table').DataTable( {
    //             "scrollX": true
    //         } );

    //     })
    // }

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
        // initmap();
        //websocker portion 
        // var notification_ws = new WebSocket('ws://' + window.location.host + '/mch-bridge/ws/');
 
      
        let protocol = "ws"
        if (location.protocol === "https:") {
            protocol = "wss"
        }
        let ws_url = `${protocol}://${window.location.host}`
        let app_path = mchHomeUrl.replace("/apps", "")
        console.log(mchHomeUrl);
        ws_url = `${ws_url}${app_path}upload-data/notifications/ws/`
        startWS(ws_url);

        $('#show_instructions').change(function(){

            if(this.checked) {
                $("#map").hide();
                $("#instructions").show();
                $("#next_plot").hide();
                $("#last_plot").hide();
                $("#comodin__div").hide(); 
            }
            else{
                if(isGraphsShowing){
                    $("#map").hide();
                    $("#next_plot").show();
                    $("#last_plot").show();
                    $("#comodin__div").show();
                }
                if(isMapShowing){
                    $("#map").show();
                    map.invalidateSize();
                    $("#next_plot").hide();
                    $("#last_plot").hide();
                    $("#comodin__div").hide();
                }
                $("#instructions").hide();

            }
        })

        $("#back_going").click(function(){

        })
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
        
        // $('#addStations').click(function() {
        //     console.log("ASFGASFAS");
        //     $("#stations_modal").modal('show');
        // })

        // $('#addGroupsStations').click(function() {
        //     console.log("ASFGASFAS");
        //     $("#stngroups_modal").modal('show');
        // })

        $('#addVariablesStation').click(function() {
            $("#variableTypesStations_modal").modal('show');
        })
        $('#addTs').click(function() {
            console.log("jkoalsf");
            $("#ts_modal").modal('show');
        })

        // $('#stations_csv_button').click(function() {
        //     console.log("ASASG");
        //     var files = document.getElementById("stations_csv").files;
        //     if(Array.from(files).length < 1 ){
        //         $.notify( "Please, submit a file to upload", "warn");
        //     }
        //     else{
        //         upload_data("stations");
        //     }
        // })

        // $('#stngroups_csv_button').click(function() {
        //     var files = document.getElementById("stngroups_csv").files;
        //     if(Array.from(files).length < 1 ){
        //         $.notify( "Please, submit a file to upload", "warn");
        //     }
        //     else{
        //         upload_data("stngroups");
        //     }
        // })
        $('#variabletypestn_csv_button').click(function() {
            var files = document.getElementById("variabletypestn_csv").files;
            if(Array.from(files).length < 1 ){
                $.notify( "Please, submit a file to upload", "warn");
            }
            else{
                upload_data("variablestationtype");
            }
        })

        $('#ts_csv_button').click(function() {
            var files = document.getElementById("ts_csv").files;
            if(Array.from(files).length < 1 ){
                $.notify( "Please, submit a file to upload", "warn");
            }
            else{
                upload_data("timeSeries");
            }
        })
        
    //    $("#stations_csv_button_preview").click(function() {
    //         var files = document.getElementById("stations_csv").files;
    //         if(Array.from(files).length < 1 ){
    //             $.notify( "Please, submit a file to preview", "warn");
    //         }
    //         else{
    //             preview_stations();
    //         }
    //     })

        
        // $("#stations_csv").change(function (evt) {
        //     evt.preventDefault();
        //     validate_stations();
        // });

        // $("#stngroups_csv_button_preview").click(function() {
        //     var files = document.getElementById("stngroups_csv").files;
        //     if(Array.from(files).length < 1 ){
        //         $.notify( "Please, submit a file to preview", "warn");
        //     }
        //     else{
        //         preview_stnGroups();

        //     }
        // })
        $("#variabletypestn_csv_button_preview").click(function() {
            var files = document.getElementById("variabletypestn_csv").files;
            if(Array.from(files).length < 1 ){
                $.notify( "Please, submit a file to preview", "warn");
            }
            else{
                preview_variabletypestn();
            }
        })

        $("#ts_csv_button_preview").click(function() {
            var files = document.getElementById("ts_csv").files;
            if(Array.from(files).length < 1 ){
                $.notify( "Please, submit a file to preview", "warn");
            }
            else{
                preview_time_series();
            }
        })

        ////////
        $('#stations_csv_upload_button').click(function() {
            var files = document.getElementById("stations_csv_upload").files;
            console.log(files);
            if(Array.from(files).length < 1 ){
                $.notify( "Please, submit a file to upload", "warn");
            }
            else{
                upload_data("stations");
            }
        });
        $('#groupStations_csv_upload_button').click(function() {
            var files = document.getElementById("groupStations_csv_upload").files;
            console.log(files);
            if(Array.from(files).length < 1 ){
                $.notify( "Please, submit a file to upload", "warn");
            }
            else{
                upload_data("stngroups");
            }
        });
        $('#variableStationTypes_csv_upload_button').click(function() {
            var files = document.getElementById("variableStationTypes_csv_upload").files;
            console.log(files);
            if(Array.from(files).length < 1 ){
                $.notify( "Please, submit a file to upload", "warn");
            }
            else{
                upload_data("variablestationtype");
            }
        })
        

    });




    return public_interface;


}());// End of package wrapper