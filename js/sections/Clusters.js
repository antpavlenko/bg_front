mainApp.config(function($routeProvider, $locationProvider) {
    $routeProvider        
        .when("/clss", {
            templateUrl : '/js/views/clusters.html',
            controller  : 'ClustersController'
        })        
        .when("/cls/new", {
            templateUrl : '/js/views/cluster_item.html',
            controller  : 'ClusterItemController'
        })
        .when("/cls/:id/:action", {
            templateUrl : '/js/views/cluster_item.html',
            controller  : 'ClusterItemController'
        });
    });


mainApp.controller('ClustersController', function($scope, $route, $routeParams, $location, $rootScope, APIResources, ModelService) {
    $rootScope.module = "cls";

    $scope.refresh = function(){

        $scope.clusters = APIResources.clusters.query();

    };
    
    $scope.deleteItem = function(item){
        APIResources.clusters.delete({"id" : item._id}, item).$promise.then(
            function(){
                $scope.refresh();
            }
        );
        
    };

    $scope.refresh();
});


mainApp.controller('ClusterItemController', function($scope, $route, $routeParams, $location, $rootScope, APIResources, ModelService) {
    $rootScope.module = "cls";

    $scope._action = $routeParams.action;

    $scope.refresh = function(){
        if($routeParams["id"]!==undefined){
            $scope.item = APIResources.clusters.get({"id" : $routeParams["id"]});
            if($scope._action=='view'){
                $scope.dimensions = APIResources.dimensions.query();
            }
        }else{
            $scope.item = {};
            $scope._action = 'edit';
        }        
    };

    $scope.save = function(item){
        var id = item._id;

        item = ModelService.cleanItem(item);

        var promise;

        if($routeParams.id!==undefined){
            promise = APIResources.clusters.update({"id" : id}, item).$promise;
        }else{
            promise = APIResources.clusters.save({}, item).$promise;
        }
        
        promise.then(
            function(){
                $scope.refresh();
                if(id!==undefined){
                    $location.path("/cls/" + id + "/view");
                }else{
                    $location.path("/clss");
                }
            }
        );
    };

    $scope.refresh();
});