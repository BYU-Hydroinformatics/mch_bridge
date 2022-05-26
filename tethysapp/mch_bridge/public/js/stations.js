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

 var LIBRARY_OBJECT = (function() {
    // Wrap the library in a package function
    "use strict"; // And enable strict mode for this library

    /************************************************************************
     *                      MODULE LEVEL / GLOBAL VARIABLES
     *************************************************************************/
    var public_interface,
        map,
        markers = L.markerClusterGroup();
    /************************************************************************
     *                    PRIVATE FUNCTION DECLARATIONS
     *************************************************************************/
    var initmap,
        preview_stations,
        validate_stations,
        arrayEquals,
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
        var isStations = '{{ isStationView|yesno:"true,false" }}';
        if(isStations){
            initmap();
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