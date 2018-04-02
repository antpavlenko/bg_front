mainApp.config(function($routeProvider, $locationProvider) {
    $routeProvider        
        .when("/ld/fct/:id", {
            templateUrl : '/js/views/diagram.html',
            controller  : 'FactsLogicalDiagramController'
        })
        .when("/ld/dim/:id", {
            templateUrl : '/js/views/diagram.html',
            controller  : 'DimensionsLogicalDiagramController'
        });
});


mainApp.controller('FactsLogicalDiagramController', function($scope, $route, $routeParams, $location, $rootScope, APIResources, ModelService) {
    $rootScope.module = "ld";

    $scope.heightStyle = {"height" : "100px"};

    $scope.obj = "fct";
    $scope.id = $routeParams.id;

    $scope.refresh = function(){
        $scope.createFactDiagram($routeParams.id);
    };

    $scope.createFactDiagram = function(factId){
        var Fact = APIResources.facts.get({"id" : factId});
        var dimensions = APIResources.dimensions.query();

        var promises = [Fact.$promise, dimensions.$promise];

        Promise.all(promises).then(
            function(){
                var graph = new joint.dia.Graph();

                var paper = new joint.dia.Paper({
                    el: $('#paper'),
                    width: 10000,
                    height: 10000,
                    gridSize: 1,
                    model: graph
                });


                var uml = joint.shapes.uml;

                var entities = {};

                var factWidth = 220;
                var factHeight = 100;

                var padding = 200;

                var factX = 20;
                var factY = 20;

                var heightWidth = 0;

                var factAttrs = {
                    '.uml-class-name-rect': {
                        fill: '#138496',
                        stroke: '#fff',
                        'stroke-width': 0.5
                    },
                    '.uml-class-name-text': {
                        fill: '#fff',
                        'font-family' : '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"'
                    },
                    '.uml-class-attrs-rect, .uml-class-methods-rect': {
                        fill: '#17a2b8',
                        stroke: '#fff',
                        'stroke-width': 0.5
                    },
                    '.uml-class-attrs-text': {
                        ref: '.uml-class-attrs-rect',
                        'ref-y': 0.5,
                        'y-alignment': 'middle',
                        fill: '#fff',
                        'font-family' : '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"'
                    },
                    '.uml-class-methods-text': {
                        ref: '.uml-class-methods-rect',
                        'ref-y': 0.5,
                        'y-alignment': 'middle',
                        fill: '#fff',
                        'font-family' : '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"'
                    }
                };

                var dimAttrs = {
                    '.uml-class-name-rect': {
                        fill: '#e0a800',
                        stroke: '#fff',
                        'stroke-width': 0.5
                    },
                    '.uml-class-name-text': {
                        fill: '#fff',
                        'font-family' : '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"'
                    },
                    '.uml-class-attrs-rect, .uml-class-methods-rect': {
                        fill: '#ffc107',
                        stroke: '#fff',
                        'stroke-width': 0.5
                    },
                    '.uml-class-attrs-text': {
                        ref: '.uml-class-attrs-rect',
                        'ref-y': 0.5,
                        'y-alignment': 'middle',
                        fill: '#fff',
                        'font-family' : '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"'
                    },
                    '.uml-class-methods-text': {
                        ref: '.uml-class-methods-rect',
                        'ref-y': 0.5,
                        'y-alignment': 'middle',
                        fill: '#fff',
                        'font-family' : '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"'
                    }
                };

                entities["fact"] = new uml.Class({
                    position: { x: factX  , y: factY },
                    size: { width: factWidth, height: factHeight },
                    name: '[ФАКТ] ' + Fact.nameRU,
                    attributes: [],
                    methods: [],
                    attrs: factAttrs,
                    entityId: Fact._id,
                    entityType: 'Fact'
                });

                heightWidth = factY + factHeight;

                var dimensionIds = {};

                for(var i=0; i<Fact.dimensions.length; i++){
                    var dimId = Fact.dimensions[i].dimension;

                    dimensionIds[dimId] = dimId;
                }

                var dimX = factX + factWidth + padding;
                var dimY = factY;

                for(var i=0; i<Object.keys(dimensionIds).length; i++){
                    var dimId = Object.keys(dimensionIds)[i];
                    var dim = dimensions._items.filter(function(d){return d._id==dimId;})[0];
                    
                    if(dim!==undefined){
                        entities[dimId] = new uml.Class({
                            position: { x: dimX  , y: dimY },
                            size: { width: factWidth, height: factHeight },
                            name: '[ИЗМЕРЕНИЕ] ' + dim.nameRU,
                            attributes: [],
                            methods: [],
                            attrs: dimAttrs,
                            entityId : dimId,
                            entityType: 'Dimension'
                        });

                        dimY = dimY + factHeight + padding;

                        heightWidth = dimY + factHeight + padding;
                    }
                }

                _.each(entities, function(c) { graph.addCell(c); });

                var relations = [];

                for(var i=0; i<Fact.dimensions.length; i++){
                    var dim = Fact.dimensions[i];

                    var rel = new uml.Generalization({
                        source: {id: entities.fact.id},
                        target: {id: entities[dim.dimension].id},
                        labels: [
                            {
                                position: .5,
                                attrs: {
                                    text: {
                                        text: dim.roleNameRU
                                    }
                                }
                            }
                        ]
                    });

                    relations.unshift(rel);
                }

                _.each(relations, function(r) { graph.addCell(r); });
                
                /*
                paper.on('cell:pointerdown', 
                    function(cellView, evt, x, y) { 
                        if(cellView.model.attributes.entityType=="Dimension"){
                            window.location.replace('/ld/dim/' + cellView.model.attributes.entityId);
                        } 
                    }
                );
                */

                $scope.heightStyle["height"] = heightWidth + 'px';
            }
        );
    };

    $scope.refresh();
});


mainApp.controller('DimensionsLogicalDiagramController', function($scope, $route, $routeParams, $location, $rootScope, APIResources, ModelService) {
    $rootScope.module = "ld";

    $scope.heightStyle = {"height" : "100px"};

    $scope.obj = "dim";
    $scope.id = $routeParams.id;

    $scope.refresh = function(){
        $scope.createDimensionDiagram($routeParams.id);
    };

    $scope.createDimensionDiagram = function(factId){
        var Dimension = APIResources.dimensions.get({"id" : factId});

        var promises = [Dimension.$promise];

        Promise.all(promises).then(
            function(){
                var graph = new joint.dia.Graph();

                var paper = new joint.dia.Paper({
                    el: $('#paper'),
                    width: 10000,
                    height: 10000,
                    gridSize: 1,
                    model: graph
                });

                var heightWidth = 0;

                var uml = joint.shapes.uml;

                var entities = {};

                var dimWidth = 220;
                var dimHeight = 100;

                var padding = 80;

                var dimX = 500;
                var dimY = 20;

                var hierAttrs = {
                    '.uml-class-name-rect': {
                        fill: '#138496',
                        stroke: '#fff',
                        'stroke-width': 0.5
                    },
                    '.uml-class-name-text': {
                        fill: '#fff',
                        'font-family' : '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"'
                    },
                    '.uml-class-attrs-rect, .uml-class-methods-rect': {
                        fill: '#17a2b8',
                        stroke: '#fff',
                        'stroke-width': 0.5
                    },
                    '.uml-class-attrs-text': {
                        ref: '.uml-class-attrs-rect',
                        'ref-y': 0.5,
                        'y-alignment': 'middle',
                        fill: '#fff',
                        'font-family' : '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"'
                    },
                    '.uml-class-methods-text': {
                        ref: '.uml-class-methods-rect',
                        'ref-y': 0.5,
                        'y-alignment': 'middle',
                        fill: '#fff',
                        'font-family' : '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"'
                    }
                };

                var typeAttrs = {
                    '.uml-class-name-rect': {
                        fill: '#c82333',
                        stroke: '#fff',
                        'stroke-width': 0.5
                    },
                    '.uml-class-name-text': {
                        fill: '#fff',
                        'font-family' : '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"'
                    },
                    '.uml-class-attrs-rect, .uml-class-methods-rect': {
                        fill: '#dc3545',
                        stroke: '#fff',
                        'stroke-width': 0.5
                    },
                    '.uml-class-attrs-text': {
                        ref: '.uml-class-attrs-rect',
                        'ref-y': 0.5,
                        'y-alignment': 'middle',
                        fill: '#fff',
                        'font-family' : '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"'
                    },
                    '.uml-class-methods-text': {
                        ref: '.uml-class-methods-rect',
                        'ref-y': 0.5,
                        'y-alignment': 'middle',
                        fill: '#fff',
                        'font-family' : '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"'
                    }
                };

                var dimAttrs = {
                    '.uml-class-name-rect': {
                        fill: '#e0a800',
                        stroke: '#fff',
                        'stroke-width': 0.5
                    },
                    '.uml-class-name-text': {
                        fill: '#fff',
                        'font-family' : '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"'
                    },
                    '.uml-class-attrs-rect, .uml-class-methods-rect': {
                        fill: '#ffc107',
                        stroke: '#fff',
                        'stroke-width': 0.5
                    },
                    '.uml-class-attrs-text': {
                        ref: '.uml-class-attrs-rect',
                        'ref-y': 0.5,
                        'y-alignment': 'middle',
                        fill: '#fff',
                        'font-family' : '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"'
                    },
                    '.uml-class-methods-text': {
                        ref: '.uml-class-methods-rect',
                        'ref-y': 0.5,
                        'y-alignment': 'middle',
                        fill: '#fff',
                        'font-family' : '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"'
                    }
                };

                if(Dimension.levels===undefined || Dimension.levels.length==0){
                    entities["dim0"] = new uml.Class({
                        position: { x: dimX  , y: dimY },
                        size: { width: dimWidth, height: dimHeight },
                        name: Dimension.nameRU,
                        attributes: [],
                        methods: [],
                        attrs: dimAttrs,
                        entityId : Dimension._id,
                        entityType: 'Level'
                    });

                    heightWidth = dimY + dimHeight;
                }else{
                    for(var i=0;i<Dimension.levels.length;i++){
                        var lvl = Dimension.levels[i];
                        entities["dim" + lvl.level] = new uml.Class({
                            position: { x: dimX  , y: dimY + (dimHeight + padding) * lvl.level * 2 },
                            size: { width: dimWidth, height: dimHeight },
                            name: "[" + Dimension.nameRU + "]" + " - " + lvl.levelNameRU,
                            attributes: [],
                            methods: [],
                            attrs: dimAttrs,
                            entityId : Dimension._id + "_" + lvl.level,
                            entityType: 'Level'
                        });

                        heightWidth = dimY + (dimHeight + padding) * lvl.level * 2 + (dimHeight + padding);
                    }
                }

                

                var relations = [];
                if(Dimension.levels!==undefined){
                    for(var i=0;i<Dimension.levels.length;i++){
                        var lvl = Dimension.levels[i];
                        var nextLvl = lvl.level-1;
                        if(lvl.level!=0){
                            if(lvl.scenarios===undefined || lvl.scenarios.length==0){

                                var rel = new uml.Generalization({
                                    source: {id: entities["dim" + lvl.level].id},
                                    target: {id: entities["dim" + nextLvl].id}
                                });
                                relations.unshift(rel);
                            }else{


                                entities["dimh" + lvl.level] = new uml.Class({
                                    position: { x: dimX - dimWidth - padding  , y: dimY + (dimHeight + padding) * lvl.level * 2 },
                                    size: { width: dimWidth, height: dimHeight },
                                    name: "[" + Dimension.nameRU + "]" + " - Иерархия",
                                    attributes: [],
                                    methods: [],
                                    attrs: hierAttrs,
                                    entityId : Dimension._id + "_h_" + lvl.level,
                                    entityType: 'Hierarchy'
                                });

                                entities["dimht" + lvl.level] = new uml.Class({
                                    position: { x: dimX - dimWidth - padding  , y: dimY + (dimHeight + padding) * lvl.level * 2 - (dimHeight + padding)},
                                    size: { width: dimWidth, height: dimHeight },
                                    name: "[" + Dimension.nameRU + "]" + " - Тип сценария иерархии",
                                    attributes: [],
                                    methods: [],
                                    attrs: typeAttrs,
                                    entityId : Dimension._id + "_ht_" + lvl.level,
                                    entityType: 'HierarchyType'
                                });

                                
                                var rel = new uml.Generalization({
                                    target: {id: entities["dim" + lvl.level].id},
                                    source: {id: entities["dimh" + lvl.level].id}
                                });
                                relations.unshift(rel);

                                rel = new uml.Generalization({
                                    target: {id: entities["dim" + nextLvl].id},
                                    source: {id: entities["dimh" + lvl.level].id}
                                });
                                relations.unshift(rel);

                                rel = new uml.Generalization({
                                    source: {id: entities["dimh" + lvl.level].id},
                                    target: {id: entities["dimht" + lvl.level].id}
                                });
                                relations.unshift(rel);
                                
                            }
                        }
                        
                        if(lvl.typizations!==undefined){
                            if(lvl.typizations.length>0){
                                for(var j=0; j<lvl.typizations.length; j++){
                                    var tp = lvl.typizations[j];

                                    var tpName = tp.nameRU;

                                    if(tp.namespace!==undefined){
                                        if(tp.namespace!==''){
                                            tpName = '[' + tp.namespace + ']' + tpName;
                                        }
                                    }

                                    entities["dimt_" + tp.nameEN] = new uml.Class({
                                        position: { x: dimX + (dimWidth + padding) * (j+1)  , y: dimY + (dimHeight + padding) * lvl.level * 2 },
                                        size: { width: dimWidth, height: dimHeight },
                                        name: tpName,
                                        attributes: [],
                                        methods: [],
                                        attrs: typeAttrs,
                                        entityId : "dimt_" + tp.nameEN,
                                        entityType: 'Typization'
                                    });

                                    var rel = new uml.Generalization({
                                        source: {id: entities["dim" + lvl.level].id},
                                        target: {id: entities["dimt_" + tp.nameEN].id}
                                    });
                                    relations.unshift(rel);
                                }
                                
                            }
                        }
                    }
                }

                _.each(entities, function(c) { graph.addCell(c); });

                _.each(relations, function(r) { graph.addCell(r); });

                $scope.heightStyle["height"] = heightWidth + 'px';
            }
        );
    };

    $scope.refresh();
});