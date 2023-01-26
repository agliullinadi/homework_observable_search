import { ofType } from 'redux-observable';
import { ajax } from 'rxjs/ajax';
import { map, mergeMap, retry, debounceTime, switchMap, catchError } from 'rxjs/operators';
import { CHANGE_SEARCH_FIELD, SEARCH_SKILLS_REQUEST } from '../action/actionTypes.js';
import { searchSkillsRequest, searchSkillsSuccess, searchSkillsFailure, resetSkills } from '../action/index.js';
import { of } from 'rxjs';

export const changeSearchEpic = action$ => action$.pipe(
    ofType(CHANGE_SEARCH_FIELD),
    map(o => o.payload.search.trim()),
    debounceTime(100),
    mergeMap((o) => {
        if (o !== '') {
            return of(searchSkillsRequest(o));
        } else {
            return of(resetSkills());
         }
     })
)

export const searchSkillsEpic = action$ => action$.pipe(
    ofType(SEARCH_SKILLS_REQUEST),
    map(o => o.payload.search),
    map(o => new URLSearchParams({ q: o })),
    // tap(o => console.log(o)),
    switchMap(o => ajax.getJSON(`${process.env.REACT_APP_SEARCH_URL}?${o}`).pipe(
        retry(3),
        map(o => searchSkillsSuccess(o)),
        // tap(o => console.log(o)),
        catchError(e => {
            of(searchSkillsFailure(e))
        })
    )),
);