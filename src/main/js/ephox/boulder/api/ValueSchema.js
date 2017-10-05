define(
  'ephox.boulder.api.ValueSchema',

  [
    'ephox.boulder.core.ChoiceProcessor',
    'ephox.boulder.core.ValueProcessor',
    'ephox.boulder.format.PrettyPrinter',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Result',
    'ephox.katamari.api.Type',
    'global!Array',
    'global!Error'
  ],

  function (ChoiceProcessor, ValueProcessor, PrettyPrinter, Fun, Result, Type, Array, Error) {
    var anyValue = ValueProcessor.value(Result.value);

    var arrOfObj = function (objFields) {
      return ValueProcessor.arrOfObj(objFields);
    };

    var arrOfVal = function () {
      return ValueProcessor.arr(anyValue);
    };

    var arrOf = ValueProcessor.arr;

    var objOf = ValueProcessor.obj;

    var objOfOnly = ValueProcessor.objOnly;

    var setOf = ValueProcessor.setOf;

    var valueOf = function (validator) {
      return ValueProcessor.value(function (v) {
        // Intentionally not exposing "strength" at the API level
        return validator(v);
      });
    };

    var extract = function (label, prop, strength, obj) {
      return prop.extract([ label ], strength, obj).fold(function (errs) {
        return Result.error({
          input: obj,
          errors: errs
        });
      }, Result.value);
    };

    var asStruct = function (label, prop, obj) {
      return extract(label, prop, Fun.constant, obj);
    };

    var asRaw = function (label, prop, obj) {
      return extract(label, prop, Fun.identity, obj);
    };

    var getOrDie = function (extraction) {
      return extraction.fold(function (errInfo) {
        // A readable version of the error.
        throw new Error(
          formatError(errInfo)
        );
      }, Fun.identity);
    };

    var asRawOrDie = function (label, prop, obj) {
      return getOrDie(asRaw(label, prop, obj));
    };

    var asStructOrDie = function (label, prop, obj) {
      return getOrDie(asStruct(label, prop, obj));
    };

    var formatError = function (errInfo) {
      return 'Errors: \n' + PrettyPrinter.formatErrors(errInfo.errors) + 
        '\n\nInput object: ' + PrettyPrinter.formatObj(errInfo.input);
    };

    var choose = function (key, branches) {
      return ChoiceProcessor.choose(key, branches);
    };

    var thunkOf = function (desc, schema) {
      return ValueProcessor.thunk(desc, schema);
    };

    var funcOrDie = function (args, schema) {
      var retriever = function (output, strength) {
        return getOrDie(
          extract('()', schema, strength, output)
        );
      };
      return ValueProcessor.func(args, schema, retriever);
    };

    return {
      anyValue: Fun.constant(anyValue),

      arrOfObj: arrOfObj,
      arrOf: arrOf,
      arrOfVal: arrOfVal,

      valueOf: valueOf,
      setOf: setOf,

      objOf: objOf,
      objOfOnly: objOfOnly,

      asStruct: asStruct,
      asRaw: asRaw,

      asStructOrDie: asStructOrDie,
      asRawOrDie: asRawOrDie,

      getOrDie: getOrDie,
      formatError: formatError,

      choose: choose,

      thunkOf: thunkOf,

      funcOrDie: funcOrDie
    };
  }
);