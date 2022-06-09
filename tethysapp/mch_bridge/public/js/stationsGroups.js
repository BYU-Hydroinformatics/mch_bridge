/*****************************************************************************
 * FILE: mch_bridge station Groups JS
 * DATE: 03/16/22
 * AUTHOR: Giovanni Romero
 * COPYRIGHT:
 * LICENSE:
 *****************************************************************************/

/*****************************************************************************
 *                      LIBRARY WRAPPER
 *****************************************************************************/

var STATIONGROUP_OBJECT = (function () {
  // Wrap the library in a package function
  "use strict"; // And enable strict mode for this library

  /************************************************************************
   *                      MODULE LEVEL / GLOBAL VARIABLES
   *************************************************************************/
  var public_interface;
  /************************************************************************
   *                    PRIVATE FUNCTION DECLARATIONS
   *************************************************************************/
  var preview_stnGroups, summary_data_load;
  // Object returned by the module

  /************************************************************************
   *                    PRIVATE FUNCTION IMPLEMENTATIONS
   *************************************************************************/

  preview_stnGroups = function () {
    $("#comodin__div").empty();
    var html_title = `<p class="p__font__h1 my_flex">Group Stations Preview <span class="flex_buttons"> <span id="go_back_stn_gr_prev" class="fake__btn hide_bar_color"> <i class="fa-solid fa-xmark"></i></span> <span id="go_back_stn_menu" class="fake__btn hidden button_icon">Menu <i class="fa-solid fa-chevron-right "></i></span> </span></p>`;

    // var html_title = `<p class="p__font__h1 my_flex">Group Stations Preview <span> <i id="go_back_stn_gr_prev"class="fa-solid fa-chevron-right fake__btn"></i> <span id="go_back_stn_menu" class="fake__btn hidden">Menu <i class="fa-solid fa-chevron-right "></i></span> </span></p>`;
    // var html_title = `<p class="p__font__h1 my_flex">Group Stations Preview<i id="go_back_stn_gr"class="fa-solid fa-chevron-right fake__btn"></i></p>`;

    // var html_title = `<p class="p__font__h1 my_flex">Group Stations Preview<i id="go_up_stn_gr_backup" class="fa-solid fa-chevron-left fake__btn"></i></p>`;

    $(html_title).appendTo("#comodin__div");
    var userFile = document.getElementById("groupStations_csv_preview")
      .files[0];
    let html_string =
      '<table id="csv_table" class="table table-striped"> </table>';
    // $('#comodin__div').html(html_string);
    $(html_string).appendTo("#comodin__div");

    html_string += "</tr></thead><tbody>";
    dfd.readCSV(userFile).then((df) => {
      // create table dinamycally
      html_string = `<thead><tr>`;
      df["$columns"].forEach(function (item, index) {
        if (item != undefined) {
          html_string += `<th>${item}</th>`;
        }
      });
      df["$data"].forEach(function (item, index) {
        html_string += "<tr>";
        item.forEach(function (value2) {
          console.log(value2, typeof value2);
          if (value2 != null) {
            html_string += `<td>${value2}</td>`;
          }
        });
        html_string += "</tr>";
      });
      html_string += "</tbody>";
      console.log(html_string);
      // $(html_string).appendTo('#csv_table')
      $("#csv_table").html(html_string);
      $("#comodin__div").removeClass("hidden");

      $("#go_back_stn_gr_prev").click(function () {
        $("#comodin__div").addClass("fadeout");
        //
        // setTimeout(function(){
        // $('#go_up_stn_gr').removeClass("hidden");
        $("#go_show_prev_stn").removeClass("hidden");

        //not sure
        if ($("#sidebar").hasClass("side_hidden")) {
          // $('#go_up_stn_gr').addClass("hidden");
          if (!$("#comodin__div").hasClass("hidden")) {
            $("#go_up_stn_gr").removeClass("hidden");
          } else {
            $("#go_up_stn_gr").addClass("hidden");
            $("#go_back_stn_menu").removeClass("hidden");
          }
        }

        $("#comodin__div").addClass("hidden");
        // },300);
      });

      $("#go_show_prev_stn").click(function () {
        $("#comodin__div").removeClass("fadeout");

        $("#go_up_stn_gr").addClass("hidden");

        // setTimeout(function(){
        if (!$("#sidebar").hasClass("side_hidden")) {
          // $('#go_up_var').addClass("hidden");
          $("#go_back_stn_menu").addClass("hidden");
        } else {
          $("#go_back_stn_menu").removeClass("hidden");
        }
        $("#go_show_prev_stn").addClass("hidden");

        $("#comodin__div").removeClass("hidden");
        // },300);
      });

      $("#go_back_stn_menu").click(function () {
        if ($("#app-content-wrapper").hasClass("show-nav")) {
          console.log("nav bar showing menu apearing");
          $("#sidebar").removeClass("side_out");
          $("#sidebar").removeClass("side_out_double");
          $("#sidebar").addClass("side_margin");
          // $("#sidebar").addClass("side_hidden");
          $("#sidebar").removeClass("side_hidden");
        }
        //nav_bar not showing
        else {
          console.log("nav bar not showing menu apearing");
          $("#sidebar").removeClass("side_out_double");
          $("#sidebar").addClass("side_margin");
          $("#sidebar").addClass("side_out");
          // $("#sidebar").addClass("side_hidden");
          $("#sidebar").removeClass("side_hidden");
        }
        $("#go_back_stn_menu").addClass("hidden");
        $(".vertical__div").addClass("margin_side");
      });
    });
  };
  summary_data_load = function () {
    var summ_obj = JSON.parse(summary_String);
    console.log(summ_obj);
    if (summ_obj.length > 0) {
      let warning_et = "The MCH instance do not have any station group";
      $.notify(warning_et, "warn");
    }
    $("#stngroups_summary__table_content").empty();

    var html_string = "";
    for (const [key, value] of Object.entries(summ_obj)) {
      html_string += "<tr>";
      html_string += `<td>${key}</td>`;
      html_string += `<td class="mega_num">${value}</td>`;
      html_string += "</tr>";
    }
    $(html_string).appendTo("#stngroups_summary__table_content");
  };

  /************************************************************************
   *                        DEFINE PUBLIC INTERFACE
   *************************************************************************/

  public_interface = {};

  /************************************************************************
   *                  INITIALIZATION / CONSTRUCTOR
   *************************************************************************/

  // Initialization: jQuery function that gets called when
  // the DOM tree finishes loading

  $(function () {
    $("#go_up_stn_gr").click(function () {
      if ($("#app-content-wrapper").hasClass("show-nav")) {
        console.log("nav bar showing menu apearing");
        $("#sidebar").removeClass("side_out");
        $("#sidebar").removeClass("side_out_double");
        $("#sidebar").addClass("side_margin");
        $("#sidebar").removeClass("side_hidden");
      }
      //nav_bar not showing
      else {
        console.log("nav bar not showing menu apearing");
        $("#sidebar").removeClass("side_out_double");
        $("#sidebar").addClass("side_margin");
        $("#sidebar").addClass("side_out");
        $("#sidebar").removeClass("side_hidden");
      }
      $("#go_up_stn_gr").addClass("hidden");
      $(".vertical__div").addClass("margin_side");
    });

    $(".hide_bar").click(function () {
      //nav bar showing
      if ($("#app-content-wrapper").hasClass("show-nav")) {
        console.log("nav bar showing not showing menu");
        $("#sidebar").addClass("side_margin");
        $("#sidebar").addClass("side_out_double");
        $("#sidebar").removeClass("side_out");
        $("#sidebar").addClass("side_hidden");
      }
      //nav_bar not showing
      else {
        console.log("nav bar not showing not showing menu");

        $("#sidebar").addClass("side_out_double");
        $("#sidebar").addClass("side_margin");
        $("#sidebar").addClass("side_out");
        $("#sidebar").addClass("side_hidden");
      }

      $(".vertical__div").removeClass("margin_side");
      // $('.hide_bar2').removeClass("hidden");

      if ($("#comodin__div").hasClass("hidden")) {
        console.log("preview widnow is hidden");
        $("#go_up_stn_gr").removeClass("hidden");
      }
      //if preview is showing
      else {
        console.log("preview widnow is showing");
        $("#go_up_stn_gr").addClass("hidden");
        $("#go_back_stn_menu").removeClass("hidden");
      }
    });

    var tab_lists = [
      "stations_tab",
      "group_station_tab",
      "variable_stn_tab",
      "time_series_tab",
    ];
    tab_lists.forEach(function (item) {
      $(`#${item}`).removeClass("active_tab");
    });
    $(`#group_station_tab`).addClass("active_tab");
    summary_data_load();
    console.log(summary_String);
    $("#previewGroupStation").click(function () {
      $("#groupStations_preview_modal").modal("show");
    });

    $("#uploadGroupstations").click(function () {
      $("#groupStations_upload_modal").modal("show");
    });

    $("#groupStations_csv_preview_button_preview").click(function () {
      var files = document.getElementById("groupStations_csv_preview").files;
      if (Array.from(files).length < 1) {
        $.notify("Please, submit a file to preview", "warn");
      } else {
        preview_stnGroups();
      }
    });
  });

  return public_interface;
})(); // End of package wrapper
