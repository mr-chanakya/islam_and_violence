$(document).ready(function() {


	// -------* start loading files *---- 

	// begin loading a country to country code loookup object
	var country_to_code;
	$.getJSON("country_to_code.json", function(data) {
		country_to_code = data;
	});

	// load csv data file and display table view
	$('#CSVTable')
		.CSVToTable('final_db.csv')
		.bind("loadComplete", function() {
	    	$('#CSVTable')
	    		.find('TABLE')
	    		.addClass("tablesorter")
	    		.attr("id", "myTable")
	    		.tablesorter({sortList: [[2,1]]});
	    	//$('#CSVTable').hide();
	    	// data loaded, time to create the map
	    	createMap();
		}
	);
	// -------* end loading files *---- 


	// -------* start creating map *---- 

	createMap = function() {


		// -------* start building data model *---- 

		// find minimum and maximum peace index
		var tds_list = $("#CSVTable td");
		var min_peace_idx = parseInt(tds_list[tds_list.length-1].innerHTML);
		var max_peace_idx =	parseInt(tds_list[2].innerHTML); 

		// generate RainbowVis's gradient object
		rainbow = new Rainbow(); 
		rainbow.setNumberRange(min_peace_idx, max_peace_idx);
		rainbow.setSpectrum('white', 'red');

		fills_obj = {defaultFill: '#ffffff'};
		data_obj = {};

		// make sure country_to_code is loaded (it should be)
		while(!country_to_code) {
			console.log("Waiting for country_to_code to load...");
		}

		// traverse the data table row by row
        $("#CSVTable").find('tr').each(function (i, el) {
        	// find all sibling table cells
    		var $tds = $(this).find('td');
            country = $tds.eq(0).text();

            // check: is country non-empty and properly defined
    		if(country) {
    			// lookup the country code
	            country_code = country_to_code[country];
	            if (country_code) {
	            	// every piece of info is available...
	            	muslim_perc = $tds.eq(1).text();
		            peace_idx = $tds.eq(2).text();
		            color = '#' + rainbow.colourAt(parseInt(peace_idx));

		            // so update the map state objects
		            fills_obj[peace_idx] = color;
		            data_obj[country_code] = {"fillKey": peace_idx, "muslimPerc": muslim_perc, "gpi":peace_idx };
		        }
	        }
	    });
		// -------* end building data model *---- 


		// -------* start drawing interactive map *---- 

        // using the newly created map state objects, draw the interactive map
	    map = new Datamap({
	        scope: 'world',
	        element: document.getElementById('CSVmap'),
	        projection: 'mercator',
	        
	        fills: fills_obj,
	        
	        data: data_obj,

	        geographyConfig: {
				borderWidth: 1,
    			borderColor: '#cccccc',
				popupTemplate: function(geo, data) {
					if(data) {
        				return ['<div class="hoverinfo"><strong>',
                    		geo.properties.name,
	                        '</strong><br/>Peace index rank: ',
	                        data.gpi,
	                        '<br/>Muslim percentage: ',
	                        data.muslimPerc,
	                        '%</div>'].join('');
					} else {
						return ['<div class="hoverinfo"><strong>',
							geo.properties.name,
							'</strong><br/>Data unavailable!</div>'].join('');
					}
				}
			},

			done: function(datamap) {
        		datamap.svg.selectAll('.datamaps-subunit').on('click', function(geography) {
            	//alert(geography.properties.name);
            	console.log(geography);
        	});}
		});
		// -------* end drawing interactive map *---- 


		// -------* start building UI *---- 

		$("#header").show("slow");

		var last_country_code = null;
		var last_country_color = null;
		var highlight_color = "#000000"

		$("#myTable td").hover(function(){
			var country = $(this).parent().find('td').eq(0).text()
			var code = country_to_code[country];

			console.log(code);

			var obj = {};
			// clear last country's highlight, if any
			if(last_country_code) {
				obj[last_country_code] = last_country_color;
				map.updateChoropleth(obj);
			}

			// take a backup of name and color before changing
			last_country_code = code;
			last_country_color = data_obj[code];

			// highlight the selected country
			obj = {};
			//if(last_country_code) obj[last_country_code] =  last_country_color;

			obj[code] = highlight_color;
			map.updateChoropleth(obj);

		});
		$("CSVmap").hover(function() {
			map.updateChoropleth(data_obj);
		})
		// -------* end building UI *---- 

	}
	// -------* end createMap *---- 

});
