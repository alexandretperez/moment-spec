(function () {
    var moment = this.moment;
    if (moment === undefined && typeof require === "function")
        moment = require("moment");
    
    if (!moment)
        throw new Error("moment not found.");

    function avoidDow(value) {
        var ref = moment();
        ref.day(value);
        this._dows.push(ref.day());
    }

    function avoidDate(value) {
        if (Array.isArray(value))
            this._dates.push.apply(this._dates, value);
        else
            this._dates.push(value);
    }

    function isInvalidDate(value) {
        return this._dates.filter(function (item) {
            var a = moment(item).startOf("day").format();
            var b = moment(value).startOf("day").format();
            return a === b;
        }).length > 0;
    }

    function MomentSpecification() {
        this._dows = [];
        this._dates = [];
        this._range = "none";
        this._ends;
    }

    MomentSpecification.prototype.avoid = function () {
        for (var i = 0, j = arguments.length; i < j; i++) {
            var arg = arguments[i];
            if (typeof arg === "number" || typeof arg === "string")
                avoidDow.call(this, arg);
            else
                avoidDate.call(this, arg);
        }
        return this;
    }

    MomentSpecification.prototype.range = function (period) {
        this._range = period;
        return this;
    }

    MomentSpecification.prototype.getEasterSunday = function (year) {
        return moment.fn.spec.getEasterSunday(year);
    }

    MomentSpecification.prototype.ends = function (handler) {
        this._ends = handler;
    }

    MomentSpecification.prototype._applyTo = function (value) {
        var copy = moment(value);

        if (this._range === "none")
            while (this._dows.indexOf(copy.day()) > -1 || isInvalidDate.call(this, copy))
                copy.add(1, "days");
        else {
            var min, max;
            switch (this._range) {
                case "week":
                    min = copy.clone().startOf("week");
                    max = copy.clone().endOf("week");
                    break;
                case "quarter":
                    min = copy.clone().startOf("quarter");
                    max = copy.clone().endOf("quarter");
                    break;
                case "month":
                    min = copy.clone().startOf("month");
                    max = copy.clone().endOf("month");
                    break;
                case "year":
                    min = copy.clone().startOf("year");
                    max = copy.clone().endOf("year");
                    break;
            }

            var offset = 1;

            while (this._dows.indexOf(copy.day()) > -1 || isInvalidDate.call(this, copy)) {
                copy.add(offset, "days");
                if (copy > max) {
                    offset = -1;
                    copy = value.clone();
                    continue;
                }

                if (copy < min)
                    throw new Error("Impossible apply the moment-spec rules.");
            }
        }

        if (typeof this._ends === "function")
            this._ends(copy);

        return copy;
    }

    moment.fn.spec = function (specification) {
        var fn = new MomentSpecification();
        specification.call(this, fn);
        return fn._applyTo(this);
    }
    
    // https://www.irt.org/articles/js052/index.htm
    moment.fn.spec.getEasterSunday = function (year) {
        var C = Math.floor(year / 100);
        var N = year - 19 * Math.floor(year / 19);
        var K = Math.floor((C - 17) / 25);
        var I = C - Math.floor(C / 4) - Math.floor((C - K) / 3) + 19 * N + 15;
        I = I - 30 * Math.floor((I / 30));
        I = I - Math.floor(I / 28) * (1 - Math.floor(I / 28) * Math.floor(29 / (I + 1)) * Math.floor((21 - N) / 11));
        var J = year + Math.floor(year / 4) + I + 2 - C + Math.floor(C / 4);
        J = J - 7 * Math.floor(J / 7);
        var L = I - J;
        var month = 3 + Math.floor((L + 40) / 44);
        var day = L + 28 - 31 * Math.floor(month / 4);
        return moment([year, month - 1, day]);
    }

}).call(this);