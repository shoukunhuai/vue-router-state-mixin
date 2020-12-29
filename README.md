# vue-router-state-mixin
This is a Vue mixin to persist component data in url query.

This mixin is inspired by [Kibana](https://www.elastic.co/kibana). Kibana keeps all the state(app and global) in url query, encoded in rison format which is url safe and human readable.

This plugin does not support global state at present.


# Install

```bash
$ npm i vue-router-state-mixin
```

# Mixin

## In main.js

Import `parseQuery` and use it as a global before guard.

```js
import routerStateMixin from 'vue-router-state-mixin';
router.beforeEach(routerStateMixin.parseQuery);
```

## In your component

Define a property named `appState`, the default value will be used as initial state and exported to `data`.

The term `appState` is borrowed from [`Kibana`](https://www.elastic.co/kibana).

```js
<script>
import routerStateMixin from 'vue-router-state-mixin';
export default {
    name: 'MyComponent',
    mixins: [routerStateMixin.createRouterStateMixin({
            syncTimeout: 200,
        })],
    props: {
        appState: {
            type: Object,
            default() {
                return {
                    pageSize: 10,
                    pageNbr: 1,
                    q: 'vue router',
                    // other ...
                    // all fields above will be watched and keep in sync with url query
                }
            }
        }
    },
    data() {
        return {
            // other non-persist data, like search results etc.
            items: [],
            total: 100
        }
    },
    computed: {
        query() {
            // Define another prop computed by several data,
            // this is a convenience way to watch multiple props.
            const {q, pageSize, pageNbr} = this;
            return {
                q,
                pageSize,
                pageNbr
            }
        }
    },
    methods: {
        search() {
            // do search on query
        }
    },
    // Do NOT forget this
    beforeRouteUpdate() {
        // ensureAppState is a method defined in mixin,
        // it will keep data synced with url
        this.ensureAppState();
    },
    watch: {
        query() {
            // search again
            this.search();
        }
    }
}
</script>
```