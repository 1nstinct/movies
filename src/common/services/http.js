/**
 * Service helper to fetch data from API
 * @returns {Promise<any | void>}
 */
import {API_URL} from "../main/config";

const get = () => fetch(API_URL)
    .then((res) => res.json())
    .catch(console.log); // eslint-disable-line
export default get;
