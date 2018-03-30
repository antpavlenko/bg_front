console.log("Loading classes and other resources...");

files = [
	"classes/APIManager",	
	"apps/mainApp",
	"directives/elem-ready",
	"controllers/DimensionsController"
];

files.forEach( function(file) {
	console.log("Loading " + file + "...");
		$.ajax({
			async:true,
			type:'GET',
			url:"www/js/" + file + ".js",
			data:null,
			dataType:'script',
			error: function(xhr, textStatus, errorThrown) {
			}
		});}
)
