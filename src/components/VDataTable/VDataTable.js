import '../../stylus/components/_tables.styl'
import '../../stylus/components/_data-table.styl'

import DataIterable from '../../mixins/data-iterable'

import Head from './mixins/head'
import Body from './mixins/body'
import Foot from './mixins/foot'
import Progress from './mixins/progress'

import {
  createSimpleFunctional,
  getObjectValueByPath
} from '../../util/helpers'

// Importing does not work properly
const VTableOverflow = createSimpleFunctional('v-table__overflow')

export default {
  name: 'v-data-table',

  data () {
    return {
      actionsClasses: 'v-datatable__actions',
      actionsRangeControlsClasses: 'v-datatable__actions__range-controls',
      actionsSelectClasses: 'v-datatable__actions__select',
      actionsPaginationClasses: 'v-datatable__actions__pagination'
    }
  },

  mixins: [DataIterable, Head, Body, Foot, Progress],

  props: {
    headers: {
      type: Array,
      default: () => []
    },
    headersLength: {
      type: Number
    },
    headerText: {
      type: String,
      default: 'text'
    },
    hideHeaders: Boolean,
    rowsPerPageText: {
      type: String,
      default: '$vuetify.lang.dataTable.rowsPerPageText'
    },
    customFilter: {
      type: Function,
      default: (items, search, filter, headers) => {
        search = search.toString().toLowerCase()
        if (search.trim() === '') return items

        const props = headers.map(h => h.value)

        return items.filter(item => props.some(prop => filter(getObjectValueByPath(item, prop), search)))
      }
    }
  },

  computed: {
    classes () {
      return {
        'v-datatable v-table': true,
        'v-datatable--select-all': this.selectAll !== false,
        'theme--dark': this.dark,
        'theme--light': this.light
      }
    },
    filteredItems () {
      return this.filteredItemsImpl(this.headers)
    },
    headerColumns () {
      return this.headersLength || this.headers.length + (this.selectAll !== false)
    }
  },

  methods: {
    hasTag (elements, tag) {
      return Array.isArray(elements) && elements.find(e => e.tag === tag)
    },
    genTR (children, data = {}) {
      return this.$createElement('tr', data, children)
    }
  },

  created () {
    const firstSortable = this.headers.find(h => (
      !('sortable' in h) || h.sortable)
    )

    this.defaultPagination.sortBy = !this.disableInitialSort && firstSortable
      ? firstSortable.value
      : null

    this.initPagination()
  },

  render (h) {
    const tbodyData = this.genTBody()
    if (tbodyData.hasTbodied) {
      this.classes['row-spans'] = true
    }

    const tableOverflow = h(VTableOverflow, {}, [
      h('table', {
        'class': this.classes
      }, [
        this.genTHead(),
        tbodyData.tbody,
        this.genTFoot()
      ])
    ])

    return h('div', [
      tableOverflow,
      this.genActionsFooter()
    ])
  }
}
