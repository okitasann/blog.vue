<template>
  <v-navigation-drawer
    id="documentation-toc"
    v-scroll="onScroll"
    :floating="structure === false"
    :right="!$vuetify.rtl"
    :width="350"
    height="80%"
    app
    clipped
  >
    <article-author></article-author>
    <article-tags></article-tags>
    <template v-if="structure !== false">
      <ul class="pt-8 mb-6 documentation-toc">
        <li class="mb-4">
          <h3 class="caption font-weight-bold text-uppercase grey--text">
            <base-markdown>Vuetify.Toc.onThisPage</base-markdown>
          </h3>
        </li>

        <template v-for="(item, i) in internalToc">
          <li
            v-if="item.visible"
            :key="i"
            :class="{
              'documentation-toc__link--subheader': item.subheader,
              'mb-2': i + 1 !== internalToc.length,
              'primary--text': activeIndex === i,
              'text--disabled': activeIndex !== i
            }"
            :style="{
              borderColor: activeIndex === i ? 'currentColor' : undefined
            }"
            class="documentation-toc__link"
          >
            <a
              :href="`#${item.id}`"
              class="d-block font-weight-medium"
              @click.stop.prevent="goTo(`#${item.id}`)"
              v-html="item.text"
            />
          </li>
        </template>
      </ul>
    </template>
  </v-navigation-drawer>
</template>

<script>
// Utilities
import kebabCase from "lodash/kebabCase";
import { goTo } from "@/util/helpers";
import { get, sync } from "vuex-pathify";
import { mapGetters } from "vuex";
export default {
  name: "ArticleToc",
  components: {
    BaseMarkdown: () => import("../base/Markdown"),
    ArticleAuthor: () => import("./Author"),
    ArticleTags: () => import("./Tags"),
  },
  data: () => ({
    activeIndex: 0,
    currentOffset: 0,
    internalToc: [],
    tocTimeout: 0,
  }),

  computed: {
    ...mapGetters(["article"]),
    structure: sync("documentation/structure"),
    toc() {
      if (!this.article.headings) return [];
      return this.article.headings
        .map((title) => {
          return {
            id: kebabCase(title.text),
            subheader: title.subTitle,
            text: title.text,
            visible: !title.subTitle,
          };
        })
        .filter((title) => title.visible);
    },
  },

  watch: {
    toc: {
      immediate: true,
      handler(val) {
        if (!val.length) return;
        this.$nextTick(() => (this.internalToc = this.toc.slice()));
      },
    },
  },

  methods: {
    goTo,
    findActiveIndex() {
      if (this.currentOffset < 100) {
        this.activeIndex = 0;
        return;
      }

      const list = this.toc.slice().reverse();

      const index = list.findIndex((item) => {
        const section = document.getElementById(item.id);
        if (!section) return false;
        return section.offsetTop - 100 < this.currentOffset;
      });
      const lastIndex = list.length - 1;
      this.activeIndex = index > -1 ? lastIndex - index : lastIndex;
    },
    onScroll() {
      this.currentOffset =
        window.pageYOffset || document.documentElement.offsetTop || 0;
      clearTimeout(this.timeout);
      this.timeout = setTimeout(this.findActiveIndex, 50);
    },
  },
};
</script>

<style lang="scss" scoped>
#documentation-toc .supporter-group__title {
  padding-left: 8px;
}

.documentation-toc {
  list-style-type: none !important;
  margin: 0;
  padding: 32px 0 0;
  text-align: left;
  width: 100%;
  z-index: 1502;
}

li {
  border-left: 2px solid transparent;
  padding: 0 24px 0 8px;
}

li a {
  color: inherit;
  font-size: 0.875rem;
  font-weight: 400;
  text-decoration: none;
  transition: color 0.1s ease-in;
}
.supporter-group {
  justify-content: flex-start !important;
}
.documentation-toc__link--subheader {
  margin-left: 8px;
}
</style>
