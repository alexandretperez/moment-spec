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

    // https://en.wikipedia.org/wiki/Computus
    moment.fn.spec.getEasterSunday = function (year) {
        var num = year % 19;
        var num1 = year / 100;
        var num2 = (num1 - num1 / 4 - (8 * num1 + 13) / 25 + 19 * num + 15) % 30;
        var num3 = num2 - num2 / 28 * (1 - num2 / 28 * (29 / (num2 + 1)) * ((21 - num) / 11));
        var num4 = num3 - (year + year / 4 + num3 + 2 - num1 + num1 / 4) % 7 + 28;
        var num5 = 3;
        if (num4 > 31) {
            num5++;
            num4 = num4 - 31;
        }
        return moment([year, num5 - 1, num4]);
    }

}).call(this);