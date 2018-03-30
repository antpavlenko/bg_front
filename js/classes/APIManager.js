var $API = {
	hostname: "http://35.188.121.31:5000",	
	returnResource : function(eveResource, objectName){
		var url = this.hostname + "/api/" + objectName + "/:id";
		var res = eveResource(url, {id: '@id', page: '@page'}, 
			{ 'get':    				{method:'GET'},
			  'save':   				{method:'POST'},
			  'query':  				{method:'GET'},
			  'remove': 				{method:'DELETE'},
			  'delete': 				{method:'DELETE'},
			  'update': 				{method:'PATCH'} }
        );

        return res;
	}
};