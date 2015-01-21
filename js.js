$(document).ready(function() 
    { 
		$('#CSVTable')
			.CSVToTable('final_db.csv')
			.bind("loadComplete",function() 
			{
		    	$('#CSVTable')
		    		.find('TABLE')
		    		.addClass("tablesorter")
		    		.attr("id", "myTable")
		    		.tablesorter();
			}
		);

		$('#container').liteTabs();
	} 
);
