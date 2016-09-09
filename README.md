# moment-spec

This plugin for [Moment.js](https://github.com/moment/moment/) helps you to manage rules that should be fulfilled when working with dates.

## Sintax

```javascript
moment().spec(function(rule){
    //...
});
```

## How to use?

### The .avoid() method

Avoiding days of week.

``` javascript
var date = moment([2016, 8, 3]); // September 3, 2016 (Saturday)
var newDate = date.spec(function(rule){
    rule.avoid('saturday', 'sunday');
});

// newDate is September 5, 2016 (Monday) because the rule say that the date should avoid saturday and sunday.
```

You also can specify the day of week by numbers from 0 (sunday) to 6 (saturday).

``` javascript
moment().spec(function(rule){
    rule.avoid(5, 6, 0); // represents 'friday', 'saturday' and 'sunday'
})
```

Avoid specific dates.

``` javascript
moment().spec(function(rule){
    rule.avoid(
        moment([2016, 8, 5]), // you can use moment constructor
        new Date(2016, 9, 5) // (and/or) native constructor
    );
});
```

You also can pass an array as parameter.

``` javascript
moment().spec(function(rule){
    var myInvalidDates = [
        moment([2016, 0, 1]),
        moment([2016, 3, 21])
    ];

    rule.avoid(myInvalidDates);
});
```

Do you want put all together? No problem.

``` javascript
moment().spec(function(rule){
    rule.avoid(0, 'Monday', new Date(2016, 8, 8), [
        moment([2016, 0, 1]),
        new Date(2016, 11, 31)
    ]);   
});
```

Or, you can call it multiple times.
``` javascript
moment().spec(function(rule){
    rule.avoid('monday', 'wednesday')
        .avoid(new Date())
        .avoid(anotherInvalidDates);
});
```

### The .range() method

This method ensures that the *resulting date* remains into a specific range.

You can specify five types of ranges: *none* (by default), *week*, *quarter*, *month* and *year*.

**NOTE:** The `.range()` method must be used with the `.avoid()` method, having no use if used alone.

``` javascript
var date = moment([2016, 5, 30]).add(1, 'month'); // July 30, 2016 (saturday)
var newDate = date.spec(function(rule){
    rule.avoid(6, 0)
        .range("month");
});
// newDate is July 29, 2016 (Friday)
```

In the case above, the `.range('month')` makes that the resulting date remains in the month of July, otherwise the result would be August 1, 2016.

In short, the `.range` method tells to `.avoid` method to move the date back if the specified range is going to be violated.

### The .ends() method

This method is called immediately after all rules being applied and before you get the *resulting date*.

``` javascript
moment().spec(function(rule){
    rule.avoid(6, 0)
        .ends(function(result){
            if (result > moment([2016, 10, 30]))
                result.month(10).endOf("month"); // mutates the result, not the original moment object.
        });
});
```


### The .getEasterSunday() method

The name is self explanatory, returns the easter sunday of an specified year.

``` javascript
moment([2016, 0, 10]).spec(function(rule){
    var year = this.year(); // 'this' represents the moment object 'January 10, 2016'
    var easter = rule.getEasterSunday(year); // March 27, 2016
    rule.avoid(easter); 
});
```

There's also a static method of it.
``` javascript
moment.fn.spec.getEasterSunday(year);
```


## General notes
### No mutation
The `.spec` plugin does not mutates the original moment object.
``` javascript
var a = moment([2016, 8, 3]); 
// 'a' is Saturday, September 3

var b = a.spec(function(rule) { rule.avoid('saturday'); });
// 'b' is Sunday, September 4
// 'a' is still Saturday, September 3
```

### Locale aware
The *moment locale* affects the `.avoid` method when you use *string* to specify the days of week.
``` javascript
moment.locale("en");
moment().spec(function(rule){
    rule.avoid("saturday", "sunday");
});

moment.locale("pt-BR");
moment().spec(function(rule){
    rule.avoid("sábado", "domingo");
});

moment.locale("fr");
moment().spec(function(rule){
    rule.avoid("samedi", "dimanche");
});
```

## License

Distributable under the terms of [MIT License](LICENSE).

