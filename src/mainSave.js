define(function(require, exports, module) {
    // import dependencies
        var Engine = require('famous/core/Engine');
        var Modifier = require('famous/core/Modifier');
        var Transform = require('famous/core/Transform');
        var Surface = require('famous/core/Surface');
        var EventHandler = require('famous/core/EventHandler');
        var convert = Math.PI / 180;
        var mainCtx = Engine.createContext();
        //Default data
        var IMG = "img/";
        var IMAGE = "img"
            //Default design
        var headHeight = 18;
        var NoX = 6;
        var NoY = 4;
        var WIDTH = window.innerWidth / NoX;
        var HEIGHT = (window.innerHeight - headHeight) / NoY;

        var NoXBigOne = 4;
        var NoYBigOne = 6;
        var WIDTHBigOne = (window.innerWidth / 2) / NoXBigOne;
        var HEIGHTBigOne = (window.innerHeight - headHeight) / NoYBigOne;
        var DURATION = 500;
        //

        //Global data
        var images = [];
        var originMatrixs = [];
        var newMatrixs = [];
        var modifiers = [];

        //Status
        var mainIndex = -1; //undefined
        var mainIndexPrev = -1; //undefined
        var animating = false;

        function createCategory() {
            //Create dummy type : 0,1,2
            var types = [0, 1, 2];
            var category = document.getElementById("type");
            for (var i = 0; i < types.length; i++) {
                var type = document.createElement("option");
                type.innerHTML = types[i];
                category.appendChild(type);
            }
            category.onchange = filterCategory;
        }

        function filterCategory() {
            var category = document.getElementById("type");
            var key = category.options[category.selectedIndex].text;
            for (var i = 0; i < NoX; i++)
                for (var j = 0; j < NoY; j++) {
                    var index = i * NoY + j;
                    if (images[index].type == key || category.selectedIndex == 0) {
                        images[index].active = true;
                        images[index].removeClass('hide');
                    } else {
                        images[index].active = false;
                        images[index].addClass('hide');
                    }
                }
            origin();
        }

        function init() {
            for (var j = 0; j < NoY; j++)
                for (var i = 0; i < NoX; i++) {
                    var index = i + j * NoX;
                    //var image = new ImageSurface({
                    //  size : [ WIDTH, HEIGHT ],
                    //  classes : [ 'image' ]
                    //});
                    var image = new Surface({
                        classes: ['child']
                    });
                    image.id = index;
                    image.type = (i + j) % 3;
                    var imgSrc = IMG + IMAGE + " (" + image.id + ").jpg";

                    var img = '<img class="image" src="' + imgSrc + '"></img>';
                    var summary = '<div class="summary"> ' + 'Summary ' + image.id + '</div>';
                    var details = '<div class="details-hide">' + '<b>Type</b>:' + image.type + '</br> The details of element </div>';

                    var info = summary + details;
                    var contentDiv = '<div class="cell">' + img + info + '</div>';
                    //var contentDiv = '<div class="cell">' + img + '</div>';
                    image.setContent(contentDiv);

                    images.push(image);
                    var modifier = new Modifier({
                        size: [WIDTH, HEIGHT],
                        origin: [0, 0]
                    });
                    modifiers.push(modifier);
                    mainCtx.add(modifier).add(image);
                    images[index].on('click', bigOne.bind(images[index]));
                    //images[index].on('mouseenter', hover.bind(images[index]));
                    //images[index].on('mouseleave', leave.bind(images[index]));
                    // init matrix for better performance
                    var matrix = Transform.translate(i * WIDTH, j * HEIGHT,
                        0);
                    originMatrixs.push(matrix);


                }
                //New matrix for bigOne
            for (var j = 0; j < NoYBigOne; j++)
                for (var i = 0; i < NoXBigOne; i++) {

                    var index = i + j * NoXBigOne;
                    console.log('translate ' +(i) * WIDTHBigOne + 3 * WIDTH)
                    var newMatrix = Transform.translate((i) * WIDTHBigOne + 3 * WIDTH, (j) * HEIGHTBigOne,
                        0);
                    newMatrixs.push(newMatrix);
                }
            createCategory();
            filterCategory();
        };

        function showText(index) {
            var details = images[index].getContent().replace('class="details-hide"', 'class="details"');
            images[index].setContent(details);
        }

        function hideText(index) {
            if (index >= 0) {
                var details = images[index].getContent().replace('class="details"', 'class="details-hide"');
                images[index].setContent(details);
            }
        }

        function origin(e) {
            if (animating) return;
            //Restore layout
            var counter = 0;
            for (var j = 0; j < NoY; j++)
                for (var i = 0; i < NoX; i++) {
                    var index = i + j * NoX;
                    if (images[index].active) {

                        var matrix = originMatrixs[counter];
                        modifiers[index].setTransform(matrix, {
                            duration: DURATION,
                            curve: 'easeInOut'
                        }, index == mainIndex ? function () {
                            //Hide details
                            hideText(mainIndex);
                            images[mainIndex].removeClass('shadow');
                            mainIndex = -1;
                            animating = false;
                        } : null);
                        modifiers[index].setSize([WIDTH, HEIGHT], {
                            duration: DURATION,
                            curve: 'easeInOut'
                        }) // Engine.pipe(images[index].handler);
                        counter++;
                    } else if (index == mainIndex) {
                        //just remove details and shadow
                        hideText(mainIndex);
                        images[mainIndex].removeClass('shadow');
                        mainIndex = -1;
                    }
                }
        };

        function bigOne(e) {
            if (animating) return;
            if (mainIndex == this.id) {
                //restore only
                origin();
                return;
            }
            if (mainIndex >= 0) {
                images[mainIndex].removeClass('shadow');
                //Hide last details
                //hideText(index);
            }
            mainIndexPrev = mainIndex;
            mainIndex = this.id;


            showText(mainIndex);
            images[mainIndex].addClass('shadow');
            matrix = Transform.translate(0, 0, 0);

            animating = true;
            modifiers[mainIndex].setTransform(matrix, {
                duration: DURATION,
                curve: 'easeInOut'
            });
            modifiers[mainIndex].setSize([window.innerWidth / 2 - 10, window.innerHeight - headHeight - 10], {
                duration: DURATION,
                curve: 'easeInOut'
            }, function () {
                animating = false;
            })

            var counter = 0;
            for (var j = 0; j < NoYBigOne; j++)
                for (var i = 0; i < NoXBigOne; i++) {

                    var index = i + j * NoXBigOne;
                    if (index == mainIndex) continue;
                    if (images[index].active) {

                        modifiers[index].setSize([WIDTHBigOne, HEIGHTBigOne], {
                            duration: DURATION,
                            curve: 'easeInOut'
                        })
                        modifiers[index].setTransform(newMatrixs[counter], {
                            duration: DURATION,
                            curve: 'easeInOut'
                        }, index == mainIndexPrev && mainIndexPrev >= 0 ? function () {
                            hideText(mainIndexPrev)
                        } : null);
                        counter++;
                    }

                }
        }

        function hover() {
            var index = this.id;
            var matrix = Transform.rotate(0.5, 0, 0);
            matrix = Transform.multiply(modifiers[index].getTransform(), matrix);
            modifiers[index].setTransform(matrix, {
                duration: 0,
                curve: 'easeInOut'
            }, null);

        }

        function leave() {
            var index = this.id;
            var matrix = Transform.rotate(-0.5, 0, 0);
            matrix = Transform.multiply(modifiers[index].getTransform(), matrix);
            modifiers[index].setTransform(matrix, {
                duration: 0,
                curve: 'easeInOut'
            }, null);

        }
        init();
        origin();
        //bigOne(0);
});
