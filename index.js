import isEqual from "lodash-es/isEqual";
import rison from "rison-node/js/rison";

export const parseQuery = (route) => {
  const { _a = "()" } = route.query;
  const appState = rison.decode(_a);
  route.query._a = appState;
};

export const createRouterStateMixin = (options) => {
  options = options || {};

  // Install global hook to parse rison encoded appState
  if (options.router) {
    router.beforeEach(parseQuery);
  }
  return {
    created() {
      // Install watcher to push state on update
      const { appState = {} } = this;
      Object.keys(appState).forEach((src) => {
        this.$watch(src, (newState) => {
          this.pushAppState({
            [src]: newState,
          });
        });
      });
    },
    data() {
      const { _a } = this.$route.query;
      // appState should be a property of the component
      // This is the initial state
      const { appState = {} } = this;

      // here we merge appState and url query(with higher priority)
      return {
        ...appState,
        ..._a,
      };
    },
    methods: {
      /**
       * Push state to url
       * @param {object} appState new partial/full state
       */
      pushAppState(appState) {
        const { name, path, query } = this.$route;

        if (
          Object.keys(appState).filter(
            (key) => !isEqual(appState[key], query._a[key])
          ).length === 0
        ) {
          /*
           * Nothing to do as new state is consistent with query.
           *
           * This happens when go forward/backward, url change
           * happened before component data.
           */

          return;
        }

        this.$router.push({
          name,
          path,
          query: {
            ...query,
            _a: rison.encode({
              ...query._a,
              ...appState,
            }),
          },
        });
      },
      // ensure state in data is consistent with query in route
      // component SHOULD invoke this method every time route changed
      ensureAppState() {
        /*
         *
         * Here we use a timeout as vue router does not have a post route
         * update hook.
         *
         */
        setTimeout(() => {
          const { _a = {} } = this.$route.query;
          let { appState = {} } = this;
          appState = {
            ...appState,
            ..._a,
          };
          Object.keys(appState).forEach((key) => {
            if (!this._isEqual(appState[key], this[key])) {
              this[key] && (this[key] = appState[key]);
            }
          }, options.syncTimeout || 200);
        });
      },
    },
  };
};

export default {
  rison,
  parseQuery,
  createRouterStateMixin,
};
