var moment = require("moment");
var mSpec = require("../src/moment-spec");

describe("Weekends Tests", function () {

    beforeEach(function () {
        moment.locale("en");
    });

    it("should avoid 'saturday' and 'sunday' (Literal)", function () {

        var date = moment([2016, 8, 3]) // Saturday, September 3, 2016
            .spec(function (rule) {
                rule.avoid("saturday", "sunday")
            });

        expect(date.format("LL")).toBe("September 5, 2016");
    });


    it("should avoid 'saturday', 'sunday' (Numeric)", function () {

        var date = moment([2016, 6, 2]) // Saturday, July 2, 2016
            .spec(function (rule) {
                rule.avoid(6, 0);
            });

        expect(date.format("LL")).toBe("July 4, 2016");
    });


    it("should avoid 'thursday', 'friday', 'saturday' and 'sunday' (Literals and Numbers).", function () {

        var date = moment([2016, 0, 14]) // Wednesday, January 16, 2016
            .spec(function (rule) {
                rule.avoid(4, 5, 'saturday', 0);
            });

        expect(date.format("LL")).toBe("January 18, 2016");
    });

});


describe("Range Tests", function () {
    var date;

    beforeEach(function () {
        moment.locale("en");
        date = moment([2016, 8, 1]);
    });


    it("should avoid 'Friday' and weekends and should remain in the week", function () {
        date = date.add(8, "days") // Friday, September 9, 2016
            .spec(function (rule) {
                rule.avoid(5, 6, 0)
                    .range("week");
            });

        expect(date.format("L")).toBe("09/08/2016");
    });

    it("should avoid 'Sunday', 'Monday' and 'Tuesday' and should remain in the month", function () {
        date = date.add(60, "days") // 10/31/2016
            .spec(function (rule) {
                rule.avoid("sunday", "monday", "tuesday")
                    .range("month");
            });

        expect(date.format("L")).toBe("10/29/2016");
    });

});

describe("Uses .ends() method for refinements", function () {

    it("should not be December", function () {

        moment.locale("en");

        var date = moment([2016, 10, 1]); // November 10, 2016

        date = date.add(1, "month").spec(function (rule) {
            rule.avoid("wednesday", "thursday")
                .ends(function (result) {
                    if (result.toDate() > new Date(2016, 10, 30))
                        result.month(10).endOf('month');
                });
        });;

        expect(date.format("L")).toBe("11/30/2016");
    });

    it("should not be between June and July", function () {

        moment.locale("en");

        var date = moment([2016, 6, 30]); // July 30, 2016
        date = date.spec(function (rule) {
            rule.ends(function (result) {
                if (result >= moment([2016, 5, 1]) && result <= moment([2016, 6, 31]))
                    result.month(7);
            });
        });

        expect(date.format("LL")).toBe("August 30, 2016");
    });

});


describe("Avoid Specific Dates and all Weekends (PT-BR)", function () {

    beforeEach(function () {
        moment.locale("pt-BR");
    });

    function MyCompanyCalendar(rule) {

        var year = this.year();
        var easter = rule.getEasterSunday(year);

        var brazilianFixedHolidays = [
            moment([year, 0, 1]),   // 1º de janeiro    - Confraternização Universal
            moment([year, 3, 21]),  // 21 de abril	    - Tiradentes	            
            moment([year, 4, 1]),   // 1º de maio	    - Dia do Trabalhador        
            moment([year, 8, 7]),   // 7 de setembro	- Independência	            
            new Date(year, 9, 12),  // 12 de outubro    - Nossa Senhora Aparecida	
            new Date(year, 10, 2),  // 2 de novembro	- Finados	                
            new Date(year, 10, 15), // 15 de novembro	- Proclamação da República	
            new Date(year, 11, 25) // 25 de dezembro	- Natal	 
        ];

        var brazilianHolidaysBasedOnEasterSunday = [
            moment(easter.clone().add(-47, "days")),   // Carnaval (terça-feira):                 quarenta e sete dias antes da Páscoa.
            moment(easter.clone().add(-2, "days")),    // Sexta-feira Santa ou Paixão de Cristo:  a sexta-feira imediatamente anterior
            moment(easter.clone().add(60, "days"))     // Corpus Christi:                         a quinta-feira imediatamente após o Domingo da Santíssima Trindade.
        ];

        rule.avoid("sábado", "domingo")
            .avoid(brazilianFixedHolidays)
            .avoid(brazilianHolidaysBasedOnEasterSunday)
            .range("month");
    }

    var L = "DD/MM/YYYY";
    it("avoid January 1", function () {
        expect(moment([2016, 0, 1]).spec(MyCompanyCalendar).format(L)).toBe("04/01/2016");
    });

    it("avoid April 21", function () {
        expect(moment([2016, 3, 21]).spec(MyCompanyCalendar).format(L)).toBe("22/04/2016");
    });

    it("avoid May 1", function () {
        expect(moment([2016, 4, 1]).spec(MyCompanyCalendar).format(L)).toBe("02/05/2016");
    });

    it("avoid September 7", function () {
        expect(moment([2016, 8, 7]).spec(MyCompanyCalendar).format(L)).toBe("08/09/2016");
    });

    it("avoid October 12", function () {
        expect(moment([2016, 9, 12]).spec(MyCompanyCalendar).format(L)).toBe("13/10/2016");
    });

    it("avoid November 2", function () {
        expect(moment([2016, 10, 2]).spec(MyCompanyCalendar).format(L)).toBe("03/11/2016");
    });

    it("avoid November 15", function () {
        expect(moment([2016, 10, 15]).spec(MyCompanyCalendar).format(L)).toBe("16/11/2016");
    });

    it("avoid November 15", function () {
        expect(moment([2016, 11, 25]).spec(MyCompanyCalendar).format(L)).toBe("26/12/2016");
    });

    it("avoid Carnaval 2016", function () {
        var easter = moment.fn.spec.getEasterSunday(2016);
        expect(easter.subtract(47, "days").spec(MyCompanyCalendar).format(L)).toBe("10/02/2016");
    });

    it("avoid Carnaval 2017", function () {
        var easter = moment.fn.spec.getEasterSunday(2017);
        expect(easter.subtract(47, "days").spec(MyCompanyCalendar).format(L)).toBe("27/02/2017");
    });

    it("avoid Sexta-feira Santa (Good Friday)", function () {
        var easter = moment.fn.spec.getEasterSunday(2016);
        expect(easter.subtract(2, "days").spec(MyCompanyCalendar).format(L)).toBe("28/03/2016");
    });

    it("avoid Corpus Christi", function () {
        var easter = moment.fn.spec.getEasterSunday(2016);
        expect(easter.add(60, "days").spec(MyCompanyCalendar).format(L)).toBe("27/05/2016");
    });
});