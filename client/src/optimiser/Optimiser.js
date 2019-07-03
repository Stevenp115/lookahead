import Timetable from "./Timetable";
class Optimiser {
  /**
   * Initialises a new timetable optimiser, given the subject list
   * @param {*} subjects
   */
  constructor(subjects) {
    this.subjects = subjects;
  }

  generateAndOptimise() {
    // Start performance tracking
    const t0 = performance.now();
    const { setPool, streamPool } = this.generateClassPools();
    // Generate all combinations of the set pool
    const streamCombinations = this.allCombinationsOf(streamPool);
    // If there are stream combinations, we go through each possibility
    const overallCombinations = [];
    for (const streamCombination of streamCombinations) {
      // Copy setPool
      const currentSetPool = [...setPool];
      // Add current combination to the set pool
      streamCombination.flat().forEach(cls => currentSetPool.push([cls]));
      const currentCombinations = this.allCombinationsOf(currentSetPool);
      overallCombinations.push(...currentCombinations);
    }
    // Convert each combination to a timetable
    const timetables = [];
    overallCombinations.forEach(comb => timetables.push(new Timetable(comb)));
    // Sort timetables
    timetables.sort(
      (a, b) =>
        a.clashes - b.clashes ||
        this.sortByDaysPresent(a, b) ||
        a.totalDaySpan - b.totalDaySpan

      // this.sortByLongestRun(3, a, b) ||
      // a.totalDaySpan - b.totalDaySpan
    );
    // Stop performance tracking
    const t1 = performance.now();
    const time = t1 - t0;
    return { timetables, time };
  }
  sortByDaysPresent(a, b) {
    let aDays = Object.keys(a.dayHours).length;
    let bDays = Object.keys(b.dayHours).length;
    return aDays - bDays;
  }
  sortByDayAvoid(dayIndex, a, b) {
    let aHours = 0;
    let bHours = 0;
    if (a.dayHours[dayIndex]) {
      aHours = a.dayHours[dayIndex];
    }
    if (b.dayHours[dayIndex]) {
      bHours = b.dayHours[dayIndex];
    }
    return aHours - bHours;
  }

  sortByLongestRun(longestRun, a, b) {
    const aValid = a.longestRun <= longestRun;
    const bValid = b.longestRun <= longestRun;
    return aValid === bValid ? 0 : aValid ? -1 : 1;
  }

  getClassTypes(subject) {
    let typeInfo = {};
    if (!subject) {
      return null;
    }
    for (const cls of subject._regularClasses) {
      const classCode = cls.classCode.type;
      if (!(classCode in typeInfo)) {
        typeInfo[classCode] = 0;
      }
      typeInfo[classCode] += 1;
    }
    return typeInfo;
  }

  allCombinationsOf(elements) {
    if (!Array.isArray(elements)) {
      throw new TypeError();
    }
    var end = elements.length - 1,
      result = [];
    function addTo(curr, start) {
      var first = elements[start],
        last = start === end;
      for (var i = 0; i < first.length; ++i) {
        var copy = curr.slice();
        copy.push(first[i]);
        if (last) {
          result.push(copy);
        } else {
          addTo(copy, start + 1);
        }
      }
    }
    if (elements.length) {
      addTo([], 0);
    } else {
      result.push([]);
    }
    return result;
  }

  generateClassPools() {
    let setPool = [];
    let streamPool = [];
    const allClassTypes = {};
    // Looping through arrays created from Object.keys
    const subjects = Object.entries(this.subjects);
    for (const [subjectCode, { data }] of subjects) {
      if (!data) {
        continue;
      }
      const subject = data;
      const { _regularClasses, _mandatoryClasses, _streamContainers } = subject;
      const classTypes = this.getClassTypes(subject);
      // Create a mapping of type: [classes] for each type
      // for example: "W": [classA, classB]
      const typeClassMappings = {};
      for (const type of Object.keys(classTypes)) {
        // Filter all classes in the current subject for this type
        const matchingClasses = _regularClasses.filter(
          cls => cls.classCode.type === type
        );
        setPool.push(matchingClasses);
        typeClassMappings[type] = matchingClasses;
      }
      // Add each mandatory class to its own set in the pool
      for (const mandatoryClass of _mandatoryClasses) {
        setPool.push([mandatoryClass]);
      }
      // Now, deal with Streams
      for (const { type, streams, name } of _streamContainers) {
        // console.log(type);
        const streamTypeClasses = [];
        for (const stream of streams) {
          streamTypeClasses.push(stream.classes);
        }
        streamPool.push(streamTypeClasses);
      }
      allClassTypes[subjectCode] = typeClassMappings;
    }
    return { setPool, streamPool };
  }
}

export default Optimiser;
