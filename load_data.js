(function(window){

  m = JSONSelect.match;

  window.extractData = function() {
    var ret = $.Deferred();

    onBBData(function(data){

      var demographics = data.demographics();
      var labs = data.labs();
      var vitals = data.vitals();

      var gender = demographics.gender === 'Female' ? "female" : "male",
      dob = new XDate(demographics.dob),
      age = Math.floor(dob.diffYears(new XDate()));

      var n = demographics.name;
      fname = n.prefix + " " + n.given.join(" ");
      lname = n.family;

      by_code = function(section, codes){
        var ret = [];
        $.each(arguments, function(i,l){
          if (i===0) return;
          ret = ret.concat(m('.results > :has(.code:val("'+l+'")) ', section));
        });
        return ret;
      };

      var hscrp = by_code(labs, "30522-7");
      var cholesterol = by_code(labs, "14647-2", "2093-3");
      var hdl = by_code(labs, "2085-9");
      var sbp = by_code(vitals, "8480-6");

      if (hscrp.length === 0){
        hscrp.push({value: 0.7, unit:"mg/L"});
      }

      if (cholesterol.length === 0){
        cholesterol.push({value: 220, unit:"mg/dL"});
      }

      if (hdl.length === 0){
        hdl.push({value: 50, unit:"mg/dL"});
      }

      if (sbp.length === 0){
        sbp.push({value: 130, unit:"mm[Hg]"});
      }

      p = defaultPatient();
      p.birthday = {value:dob};
      p.age = {value:age};
      p.gender={value:gender};
      p.givenName={value:fname};
      p.familyName={value:lname};
      p.hsCRP={value:hscrp_in_mg_per_l(hscrp[0])};
      p.cholesterol={value:cholesterol_in_mg_per_dl(cholesterol[0])};
      p.HDL={value:cholesterol_in_mg_per_dl(hdl[0])};
      p.LDL = {value:p.cholesterol.value-p.HDL.value};
      p.sbp = {value:sbp[0].value};
      ret.resolve(p);
    });

    return ret.promise();
  };

  function defaultPatient(){
    return {
      smoker_p: {value: false},
      fx_of_mi_p: {value: false}
    }
  };

  cholesterol_in_mg_per_dl = function(v){
    if (v.unit === "mg/dL"){
      return parseFloat(v.value);
    }
    else if (v.unit === "mmol/L"){
      return parseFloat(v.value)/ 0.026;
    }

    throw "Unanticipated cholesterol units: " + v.unit;
  };

  hscrp_in_mg_per_l = function(v){
    if (v.unit === "mg/L"){
      return parseFloat(v.value);
    }
    throw "Unanticipated hsCRP units: " + v.unit;
  };

})(window);
