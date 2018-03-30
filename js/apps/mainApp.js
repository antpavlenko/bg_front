

var mainApp =
(function (A) {
  

	var mainApp = angular.module('mainApp', ['ngRoute', 'com.dailymotion.ngEveResource']);

    mainApp.config(['$resourceProvider', function($resourceProvider){
        $resourceProvider.defaults.stripTrailingSlashes = false;
    }]);
	
	mainApp.config(function($routeProvider, $locationProvider) {
		$locationProvider.html5Mode({
		    enabled: true,
		    requireBase: false
		});
    });

    mainApp.config(['$routeProvider', '$httpProvider', function($routeProvider, $httpProvider) {
        $httpProvider.defaults.cache = false;
        if (!$httpProvider.defaults.headers.get) {
          $httpProvider.defaults.headers.get = {};
        }
    }]);
	
	mainApp.run(function($rootScope, $timeout, $location, $resource) {
        $rootScope.namespaceList = [{"nameRU" : "Лотереи"}, {"nameRU" : "Букмекер"}];
        $rootScope.factTypeList = [{"nameRU" : "Транзакционный"}, {"nameRU" : "Период"}, {"nameRU" : "Момент"}];
        $rootScope.dimensionHistoryTypeList = [{"nameRU" : "НСИ (без бизнес-истории)"}, {"nameRU" : "Мастер-данные"}, {"nameRU" : "НСИ"}];
    });

    mainApp.service('APIResources', function(eveResource){
        var resourceList = ["dimensions", "clusters", "facts"];
        
        for(var i=0; i<resourceList.length; i++){
            var name = resourceList[i];
            this[name] = $API.returnResource(eveResource, name);
        }
    });

    mainApp.service('ModelService', function(){
        this.cleanItem = function(item){
            var cleanedItem = item;
            
            for(var prop in cleanedItem){
                if(prop.charAt(0)=="_"){
                    cleanedItem[prop] = undefined;
                }
            }

            return cleanedItem;
        };
        
        this.new = function(arr){
            var item = {"_new" : true, "_changing" : true};
            arr.$promise.then(
                function(){
                    arr._items.unshift(item);
                }
            );
        };

        this.change = function(item){
            item["_changing"] = true;
        };

        this.clear = function(i, arr){
            arr.splice(arr.indexOf(i), 1);
        };
    });

    console.log("Main App is activated");
    return mainApp;
}(this.angular));