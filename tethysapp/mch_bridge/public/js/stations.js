/*****************************************************************************
 * FILE: mch_bridge Map JS
 * DATE: 03/16/22  
 * AUTHOR: Giovanni Romero
 * COPYRIGHT:
 * LICENSE:
 *****************************************************************************/

/*****************************************************************************
 *                      LIBRARY WRAPPER
 *****************************************************************************/

 var STATION_OBJECT = (function() {
    // Wrap the library in a package function
    "use strict"; // And enable strict mode for this library

    /************************************************************************
     *                      MODULE LEVEL / GLOBAL VARIABLES
     *************************************************************************/
    var public_interface,
        map,
        markers = L.markerClusterGroup(),
        markers_summ = L.markerClusterGroup();

    /************************************************************************
     *                    PRIVATE FUNCTION DECLARATIONS
     *************************************************************************/
    var initmap,
        preview_stations,
        validate_stations,
        arrayEquals,
        summary_data_load,
        summary_plot_load;
		// Object returned by the module



    /************************************************************************
     *                    PRIVATE FUNCTION IMPLEMENTATIONS
     *************************************************************************/


    arrayEquals = function (a, b) {
        return Array.isArray(a) &
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
    summary_plot_load = function(){
        var summ_obj = JSON.parse(summary_Plot);
        console.log(summ_obj);
        let latlongs = []

        summ_obj.forEach(function (item, index) {
            var lat_lng_ob = item['latlng'];
            console.log(typeof(lat_lng_ob[0]))
            if(lat_lng_ob[0] != undefined && lat_lng_ob[1] != undefined ){
                let marker = L.marker([parseFloat(lat_lng_ob[1]), parseFloat(lat_lng_ob[0])]).bindPopup(`${item['StationName']}`);
                markers_summ.addLayer(marker);
                latlongs.push([parseFloat(lat_lng_ob[1]), parseFloat(lat_lng_ob[0])])
            }
          });

        map.addLayer(markers_summ);
        var bounds = new L.LatLngBounds(latlongs);
        map.fitBounds(bounds);
    }
    summary_data_load = function(){
        var summ_obj = JSON.parse(summary_String);
        console.log(summ_obj);
        $('#stations_summary__table_content').empty();

        var html_string = '';
        for (const [key, value] of Object.entries(summ_obj)) {
            html_string += '<tr>'
            html_string += `<td>${key}</td>`;
            html_string += `<td  class="mega_num">${value}</td>`;
            html_string += '</tr>';
        }
        $(html_string).appendTo('#stations_summary__table_content');
        
    }
    preview_stations = function(){
        $('#comodin__div').empty();
        let userFile = document.getElementById("stations_csv_preview").files[0];
        let latlongs = []

        dfd.readCSV(userFile).then((df) => {
            console.log(df);

            df['$data'].forEach(function (item, index) {
                if(item[8] != undefined && item[7] != undefined ){
                    console.log(typeof(item[8]), typeof(item[7]));
                    let marker = L.marker([parseFloat(item[8]), parseFloat(item[7])]).bindPopup(`${item[1]}`);
                    markers.addLayer(marker);
                    latlongs.push([parseFloat(item[8]), parseFloat(item[7])])

                }
              });

            map.addLayer(markers);
            var bounds = new L.LatLngBounds(latlongs);
            map.fitBounds(bounds);
            markers_summ.clearLayers();

        })

    }
    validate_stations = function(type_func){
        let warning_et = 'The File format is correct';
        let userFile;
        if(type_func == 'preview'){
            userFile = document.getElementById("stations_csv_preview").files[0];
        }
        if(type_func == 'upload'){
            userFile = document.getElementById("stations_csv_upload").files[0];
        }
        // console.log(document.getElementById("stations_csv_preview").files);
        // let userFile = document.getElementById("stations_csv").files[0];
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
        // hide side_bar
        // $('.hide_bar').click(function(){

        //     $('.horizontal__div').removeClass("margin_side");
        //     $(".hide_bar_div").hide();
        //     $('.hide_bar2').removeClass("hidden");
   
        // })

        $('.hide_bar2').click(function(){
            if($("#app-content-wrapper").hasClass("show-nav")){
                console.log("nav bar showing menu apearing");
                $("#sidebar").removeClass("side_out");
                $("#sidebar").removeClass("side_out_double");
                $("#sidebar").addClass("side_margin");
            }
            //nav_bar not showing
            else{
                console.log("nav bar not showing menu apearing");
                $("#sidebar").removeClass("side_out_double");
                $("#sidebar").addClass("side_margin");
                $("#sidebar").addClass("side_out");


            }
            $('.hide_bar2').addClass("hidden");
            $('.horizontal__div').addClass("margin_side");

    })

    $(".hide_bar").click(function(){
            //nav bar showing
            if($("#app-content-wrapper").hasClass("show-nav")){
                console.log("nav bar showing not showing menu");
                $("#sidebar").addClass("side_margin");
                $("#sidebar").addClass("side_out_double");
                $("#sidebar").removeClass("side_out");
            }
            //nav_bar not showing
            else{
                console.log("nav bar not showing not showing menu");
   
                $("#sidebar").addClass("side_out_double");
                $("#sidebar").addClass("side_margin");
                $("#sidebar").addClass("side_out");

            }

            $('.horizontal__div').removeClass("margin_side");
            $('.hide_bar2').removeClass("hidden");

    })

        // $('.hide_bar2').click(function(){
        //         if($("#app-content-wrapper").hasClass("show-nav")){
        //             console.log("nav bar showing menu apearing");

        //             // $("#sidebar").addClass("side_zero");
        //             $("#sidebar").removeClass("side_out");
        //             if($("#sidebar").hasClass("side_out_double")){
        //                 $("#sidebar").removeClass("side_out_double");
        //             }


        //         }
        //         //nav_bar not showing
        //         else{
        //             console.log("nav bar not showing menu apearing");

        //             // $("#sidebar").addClass("side_zero");
        //             $("#sidebar").removeClass("side_out_double");
        //         }
        //         $('.hide_bar2').addClass("hidden");
        //         $('.horizontal__div').addClass("margin_side");

        // })

        // $(".hide_bar").click(function(){
        //     // if($("#app-content-wrapper").hasClass("show-nav")){
        //         //nav bar showing
        //         if($("#app-content-wrapper").hasClass("show-nav")){
        //             console.log("nav bar showing menu dissapearing");

        //             // $("#sidebar").removeClass("side_zero");
        //             $("#sidebar").addClass("side_out");
        //         }
        //         //nav_bar not showing
        //         else{
        //             console.log("nav bar not showing menu dissapearing");
        //             // if($("#sidebar").hasClass("side_out_double")){
        //             //     $('#sidebar').removeClass("site_out");
        //             // }
        //             // $("#sidebar").removeClass("side_zero");
        //             $("#sidebar").addClass("side_out_double");
        //         }

        //         $('.horizontal__div').removeClass("margin_side");
        //         $('.hide_bar2').removeClass("hidden");
 
        // })


        // Make tab available and active
        // console.log(summary_Plot);
        var tab_lists = ["stations_tab","group_station_tab","variable_stn_tab","time_series_tab"];
        tab_lists.forEach(function(item){
            $(`#${item}`).removeClass("active_tab");
        });
        $(`#stations_tab`).addClass("active_tab"); 

        var isStations = '{{ isStationView|yesno:"true,false" }}';
        if(isStations){
            initmap();
            summary_data_load();
            // console.log(summary_Plot);
            // console.log(JSON.parse(summary_Plot));
            const noStations = Object.keys(JSON.parse(summary_Plot)).length === 0;
            if(!noStations){
                summary_plot_load();
            }

        }

        $("#stations_csv_preview").change(function (evt) {
            evt.preventDefault();
            validate_stations('preview');
        });
        $("#stations_csv_upload").change(function (evt) {
            evt.preventDefault();
            validate_stations('upload');
        });
        $('#uploadStations').click(function() {
            $("#stations_upload_modal").modal('show');
        })

        $('#previewStations').click(function() {
            $("#stations_preview_modal").modal('show');
        })
        $("#stations_csv_preview_button_preview").click(function() {
            var files = document.getElementById("stations_csv_preview").files;
            if(Array.from(files).length < 1 ){
                $.notify( "Please, submit a file to preview", "warn");
            }
            else{
                preview_stations();
            }
        })

    });




    return public_interface;


}());// End of package wrapper