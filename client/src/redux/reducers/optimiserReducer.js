import {
  BEGIN_OPTIMISATION,
  COMPLETE_OPTIMISATION,
  NEXT_TIMETABLE,
  PREVIOUS_TIMETABLE,
  CREATE_CUSTOM_TIMETABLE,
  UPDATE_CUSTOM_TIMETABLE,
  VIEW_GENERATED_TIMETABLES,
  VIEW_CUSTOM_TIMETABLES
} from "../actionTypes";
import uuid from "uuid/v1";

const initialState = {
  optimising: false,
  timetables: null,
  currentView: "generated",
  currentIndex: 0,
  currentCustomIndex: 0,
  customTimetables: [
    /**
     * {
     *  id: unique uuid
     *  name: 'Name of Custom Timetable'
     *  timetable: [SubjectClass]
     * }
     */
  ]
};

export default (state = initialState, action) => {
  switch (action.type) {
    case VIEW_GENERATED_TIMETABLES:
      // Regular timetable index
      let tt_index = state.currentCustomIndex;
      if (tt_index < 0 || tt_index >= state.timetables.length) {
        tt_index = 0;
      }
      return { ...state, currentView: "generated", currentIndex: tt_index };
    case VIEW_CUSTOM_TIMETABLES:
      // Custom timetable index
      let ctt_index = state.currentCustomIndex;
      if (ctt_index < 0 || ctt_index >= state.customTimetables.length) {
        ctt_index = 0;
      }
      return {
        ...state,
        currentView: "custom",
        currentCustomIndex: ctt_index
      };
    case CREATE_CUSTOM_TIMETABLE:
      const newCustomTimetable = {
        id: uuid().split("-")[0],
        name: action.payload.name,
        timetable: action.payload.timetable
      };
      return {
        ...state,
        customTimetables: [...state.customTimetables, newCustomTimetable]
      };
    case UPDATE_CUSTOM_TIMETABLE:
      const customTTCopy = [...state.customTimetables];
      const customFound = customTTCopy.filter(
        ctt => ctt.id === action.payload.id
      );
      if (!customFound) {
        return state;
      } else {
        // Update timetable information
        customFound.name = action.payload.name;
        customFound.timetable = action.payload.timetable;
      }
      return { ...state, customTimetables: customTTCopy };
    case NEXT_TIMETABLE:
      if (state.currentIndex + 1 < state.timetables.length) {
        return { ...state, currentIndex: state.currentIndex + 1 };
      }
      return state;
    case PREVIOUS_TIMETABLE:
      if (state.currentIndex - 1 >= 0) {
        return { ...state, currentIndex: state.currentIndex - 1 };
      }
      return state;
    case BEGIN_OPTIMISATION:
      return { ...state, optimising: true };
    case COMPLETE_OPTIMISATION:
      const { timetables } = action.payload;
      console.log(timetables.length + " timetables generated.");
      return {
        ...state,
        optimising: false,
        currentIndex: 0,
        timetables
      };

    default:
      return state;
  }
};
