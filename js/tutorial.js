var Tutorial = function () {
    return {
        initialize: function () {
            this.steps = [
                {
                    ele: $(".leaflet-draw-draw-polyline"),
                    content: "First, draw a set of lines that will define the boundaries of some polygons."
                },
                {
                    ele: $(".leaflet-draw-draw-rectangle"),
                    content: "Next, draw a box to select a set of lines you wish to use to create polygons."
                },
                {
                    ele: $(".build-polys-button"),
                    content: "Finally, click here to create polygons from the selected lines."
                }
            ];
        
            this.step = 0;
                
            this.steps.forEach(function (step, index) {
                var content = "<p>" + step.content + "</p>",
                    cancelText = index !== 2 ? "Cancel Tutorial" : "Finish Tutorial";
                content += "<div class='btn-group pull-right'>";
                content += "<button class='btn tutorial-cancel' href='#'>" + cancelText + "</button>";
                if (index !== 2) {
                    content += "<button class='btn btn-primary tutorial-next' href='#'>Next Step > </button>";
                }
                content += "</div>";
                
                step.ele.popover({
                    title: "Make some Polygons",
                    html: true,
                    content: content,
                    container: "#tutorial",
                    trigger: "manual",
                    animation: false
                });
            });
        },
        
        restart: function () {
            this.step = 0;
            this.isCanceled = false;
            this.next();
        },
            
        toStep: function (step) {
            this.step = step - 1;
            this.next();
        },
        
        cancel: function () {
            if (this.step !== 0) { this.steps[this.step - 1].ele.popover("hide"); }
            this.isCanceled = true;
        },
        
        next: function () {
            if (this.isCanceled) { return; }
            
            var next = this.next,
                cancel = this.cancel,
                self = this;
            
            if (this.step !== 0) {
                this.steps[this.step - 1].ele.popover("hide");
            }
            
            this.step = this.step + 1 > 3 ? 0 : this.step + 1;
            if (this.step !== 0) {
                this.steps[this.step - 1].ele.popover("show");
                
                $(".tutorial-cancel").one("click", function (e) {
                    cancel.call(self);
                });
                
                $(".tutorial-next").one("click", function (e) {
                    next.call(self);
                });
            } else {
                this.cancel();
            }
        }
    };
};