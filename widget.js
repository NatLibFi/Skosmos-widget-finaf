/* global Vue, L */

const TITLEWINDOW = {
  vueApp: null,
  createVueApp: function () {
    return Vue.createApp({
      data() {
        return {
          header: TITLEWINDOW.headers[TITLEWINDOW.language] + " > " + TITLEWINDOW.prefLabel,
          natLibURL:
            TITLEWINDOW.finnaURL +
            TITLEWINDOW.authorPrefix +
            TITLEWINDOW.identifier +
            TITLEWINDOW.languageSuffix[TITLEWINDOW.language],
          natLibText: TITLEWINDOW.finnaSearchTexts[TITLEWINDOW.language],
          noteText: TITLEWINDOW.noteText,
          fontTexts: TITLEWINDOW.fontTexts,
          buttonTexts: TITLEWINDOW.buttonTexts,
          FormatListsStatus: {
            author2_id_str_mv: {Image: false, Book: false, Sound: false, Journal: false, MusicalScore: false, Video: false},
            topic_id_str_mv: {Image: false, Book: false, Sound: false, Journal: false, MusicalScore: false, Video: false}
          }
        };
      },
      template: `
                <div class="panel-group" id="finaf-widget" role="tablist" aria-multiselectable="true">
                  <div class="panel panel-default">
                    <div class="panel-heading" id="finaf-heading">
                      <button
                        class="accordion-button accordion"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#finaf-collapse"
                        aria-expanded="true"
                        aria-controls="finaf-collapse"
                        id="finaf-header-button"
                      >
                        <div>{{header}}</div>
                      </button>
                    </div>
                    <div id="finaf-collapse" class="panel-collapse collapse show" role="tabpanel" aria-labelledby="finaf-heading">
                      <div class="panel-body">
                        <div id="finaf-note">
                          {{noteText}}
                        </div>
                        <div id="finaf-title-wrapper">
                          <div class="finaf-column" v-for="(values, role) in records">
                            <h3 class="versal-bold">{{ getRoleTranslation(role) }}</h3>
                            <div v-for="(titleList, format) in values">
                              <h4 class="versal-bold">{{ getFormatTranslation(format) }}
                                <span :class="'fa-solid fa-' + fontTexts[format]"
                              </h4>
                              <ul class="finaf-titles-list">
                                <li v-for="(titleData) in renderTitleList(titleList, FormatListsStatus[role][format])">
                                  <a :href="titleData.url" target="_blank">{{ shortenTitle(titleData.title) }}</a> ({{ titleData.year }})
                                </li>
                              </ul>
                              <button class="toggle-text versal" @click="toggleButton($event, FormatListsStatus, role, format)">
                                {{ getToggleButtonText(FormatListsStatus[role][format]) }}
                                <i :class="'fa-solid fa-chevron-' + (FormatListsStatus[role][format] ? 'up' : 'down')"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div id="finaf-search">
                        <a class="versal" :href=natLibURL target="_blank">{{natLibText}}</a>
                      </div>
                    </div>
                  </div>
                </div>
                `,
      computed: {
        records() {
          return TITLEWINDOW.renderedTitles;
        }
      },
      methods: {
        getRoleTranslation(role) {
          return TITLEWINDOW.translatedLookforFields[role][TITLEWINDOW.language]
        },
        getFormatTranslation(format) {
          return TITLEWINDOW.formatTranslations[format][TITLEWINDOW.language]
        },
        getToggleButtonText(opened) {
          return opened
            ? TITLEWINDOW.buttonTexts["less"][TITLEWINDOW.language]
            : TITLEWINDOW.buttonTexts["more"][TITLEWINDOW.language];
        },
        toggleButton(event, formatListsOpened, role, format) {
          if (formatListsOpened[role][format]) {
            formatListsOpened[role][format] = false;
          } else {
            formatListsOpened[role][format] = true;
          }
        },
        renderTitleList(titleList, opened) {
          return opened ? titleList : titleList.slice(0, 5);
        },
        shortenTitle(title) {
          if (title.length > 90) {
            title = title.substr(0, 90) + " [...]";
          }
          return title;
        },
      },
    });
  },

  // variables for query parameters:
  lookforFields: ["author2_id_str_mv", "topic_id_str_mv"],

  apiUrl: "https://api.finna.fi/v1/search?",
  authorIdIdentifier: "melinda.(FI-ASTERI-N)",
  finnaURL: "https://kansalliskirjasto.finna.fi/",
  recordPrefix: "Record/",
  authorPrefix: "AuthorityRecord/melinda.(FI-ASTERI-N)",
  languageSuffix: {
    fi: "?lng=fi",
    sv: "?lng=sv",
    en: "?lng=en",
    se: "?lng=se",
  },
  institution: 'building:"0\/NLF\/"',
  filters: ['building:"0/NLF/"', 'finna.deduplication:"0"'],
  fields: ["shortTitle", "OtherRecordLink", "formats", "id", "year"],
  /*Available values : relevance, id asc, main_date_str desc, main_date_str asc, callnumber,
  author, title, last_indexed desc,id asc, first_indexed desc,id asc
  */
  sortOrder: "main_date_str desc",
  limit: 100,
  maxResults: 1000, //maximum number of results to be queried from Finna API
  identifier: null,
  prefLabel: "",
  language: "fi",
  noteText: "",

  headers: {
    fi: "Kansalliskirjaston aineistot",
    sv: "Nationalbibliotekets samlingar",
    en: "The Collections of the National Library",
    se: "Álbmotgirjeráju' čoakkáldagat"
  },

  translatedLookforFields: {
    author2_id_str_mv: {
      fi: "Tekijänä teoksissa",
      sv: "upphov för verken",
      en: "as author",
      se: "Dahkkin dujiin",
    },
    topic_id_str_mv: {
      fi: "Aiheena teoksissa",
      sv: "ämne i verken",
      en: "as topic",
      se: "Fáddán dujiin",
    },
  },

  formatTranslations: {
    Image: { fi: "kuvia", sv: "bilder", en: "images", se: "govat" },
    Book: { fi: "kirjoja", sv: "böcker", en: "books", se: "girjjit" },
    Sound: {
      fi: "äänitteitä",
      sv: "ljudspelningar",
      en: "sound recordings",
      se: "jietnabáttit",
    },
    Journal: {
      fi: "lehtiä ja artikkeleita",
      sv: "tidskriftar och artiklar",
      en: "journals and articles",
      se: "aviissat ja artihkkalat",
    },
    MusicalScore: {
      fi: "nuotteja",
      sv: "noter",
      en: "musical scores",
      se: "nuohtat",
    },
    Video: { fi: "videoita", sv: "video", en: "videos", se: "videot" },
    Thesis: {
      fi: "opinnäytteitä",
      sv: "examensarbeten",
      en: "theses",
      se: "oahppočájánasat",
    },
  },

  formatSortOrder: [
    "Book",
    "Sound",
    "MusicalScore",
    "Video",
    "Journal",
    "Image",
  ],

  fontTexts: {
    Image: "image",
    Book: "book",
    Sound: "compact-disc",
    Journal: "file-lines",
    MusicalScore: "music",
    Video: "film",
  },

  noteTexts: {
    error: {
      fi: "Tekijälle ei löydy julkaisuja.",
      sv: "Inga utgåvor hittas för upphovspersonen.",
      en: "No publications found for the author.",
      se: "Dahkkái eai gávdno publikašuvnnat.",
    },
    source: {
      fi: "Tietoja toimijaan liittyvästä aineistosta haettu Kansalliskirjaston hakupalvelusta.",
      sv: "Information om material som relaterar till aktören har hämtats från Nationalbibliotekets söktjänst.",
      en: "Information about authors’ publications is received from the National Library Search Service.",
      se: "Dieđut doibmii laktáseaddji materiálain leat vižžon álbmotbibliografiijas Finna bokte.",
    },
  },

  buttonTexts: {
    more: {
      fi: "Näytä kaikki",
      sv: "Visa allt",
      en: "Show all",
      se: "Čájet visot",
    },
    less: {
      fi: "Näytä vähemmän",
      sv: "Visa mindre",
      en: "Show less",
      se: "Čájet uhcit",
    },
  },

  finnaSearchTexts: {
    fi: "Katso kaikki hakutulokset Kansalliskirjaston hakupalvelusta",
    sv: "Se alla sökresultat från Nationalbibliotekets söktjänst",
    en: "See all the results from the National Library Search",
    se: "Geahča ohcanbohtosiid Álbmotgirjeráju ohcanbálvalusas",
  },

  generateQueryString: function (identifier, lookforField, offset) {
    identifier = '"' + TITLEWINDOW.authorIdIdentifier + identifier + '"';
    var lookfor = "lookfor=" + lookforField + ":" + identifier;
    var url = TITLEWINDOW.apiUrl + lookfor;
    var parameters = {
      field: TITLEWINDOW.fields,
      filter: TITLEWINDOW.filters,
      limit: TITLEWINDOW.limit,
      sort: TITLEWINDOW.sortOrder,
      page: offset,
    };
    for (const key in parameters) {
      value = parameters[key];
      if (value instanceof Array) {
        for (const index in value) {
          url += "&" + key + "[]=" + value[index];
        }
      } else {
        url += "&" + key + "=" + value;
      }
    }
    return url;
  },

  queryFinna: function (url, label) {
    return fetch(url)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        return {
          results: data,
          label: label,
        };
      });
  },

  renderedTitles: {},
  handleQueryResults: function (results) {
    Object.keys(results).forEach((role) => {
      const records = Array.prototype.concat.apply([], results[role])
      const titles = {};

      records.forEach((record) => {
        const title = record.shortTitle;
        const url = TITLEWINDOW.finnaURL + TITLEWINDOW.recordPrefix + record.id;
        const year = record.year;
        let recordFormat;
        // the hierarchically highest level of format gets chosen
        const firstFormat =
          Array.isArray(record.formats) && record.formats[0]
            ? record.formats[0]
            : null;
        const valueList =
          firstFormat && firstFormat.value
            ? String(firstFormat.value).split("/")
            : [];
        if (valueList.length > 1) {
          recordFormat = valueList[1];
        }

        if (recordFormat && recordFormat in TITLEWINDOW.formatTranslations) {
          if (recordFormat === "Thesis") recordFormat = "Book";

          if (titles[recordFormat] === undefined) {
            titles[recordFormat] = {};
          }

          const key = title.toLowerCase();
          if (titles[recordFormat][key] === undefined) {
            titles[recordFormat][key] = { title, year, url };
          } else {
            let recordTitle = titles[recordFormat][key].title;
            let recordYear = titles[recordFormat][key].year;
            const parsedExisting = parseInt(recordYear, 10);
            const parsedNew = parseInt(year, 10);
            if (!Number.isNaN(parsedExisting) && !Number.isNaN(parsedNew)) {
              if (parsedExisting > parsedNew) {
                titles[recordFormat][key].year = recordYear;
              } else {
                titles[recordFormat][key].year = recordYear;
              }
            }
            // if the same title is in uppercase,
            // it is replaced by title with one or more lowercase letters
            if (title.toUpperCase() !== title && title !== recordTitle) {
              titles[recordFormat][key].title = title;
            }
          }
        }
      });
        this.renderedTitles[role] = {};

      TITLEWINDOW.formatSortOrder.forEach((recordFormat) => {
        if (recordFormat in titles) {
          this.renderedTitles[role][recordFormat] = [];

          Object.keys(titles[recordFormat]).forEach((key) => {
            const record = titles[recordFormat][key];
            this.renderedTitles[role][recordFormat].push({
              title: record.title,
              year: record.year,
              url: record.url,
            });
          });
        }
      });
    });
  },

  render: function () {
    if (TITLEWINDOW.renderedTitles === "{}") {
      TITLEWINDOW.noteText += TITLEWINDOW.noteTexts["error"][TITLEWINDOW.language] + " "
    }
    TITLEWINDOW.noteText += TITLEWINDOW.noteTexts["source"][TITLEWINDOW.language];
    const mountPoint = document.getElementById("finaf-plugin");
    if (mountPoint) {
      if (this.vueApp) {
        this.vueApp.unmount();
      }
      mountPoint.remove();
    }
    const newMountPoint = document.createElement("div");
    newMountPoint.id = "finaf-plugin";
    document
      .getElementById("main-content-bottom-slot")
      .appendChild(newMountPoint);

    this.vueApp = this.createVueApp();
    this.vueApp.mount("#finaf-plugin");
  },
};

document.addEventListener("DOMContentLoaded", function () {
  window.titleWindow = function (data) {
    // Only activate the widget when
    // 1) on an authority page
    // 2) and there is a prefLabel
    // 3) and the json-ld data can be found
    // 4) and there is an identifier
    if (
      data.pageType !== "concept" ||
      data.prefLabels.length === 0 ||
      Object.keys(data.jsonLd).length === 0
    ) {
      return;
    }
    const finnishLabel = data.prefLabels.find(item => item.lang === "fi");
    TITLEWINDOW.prefLabel = finnishLabel ? finnishLabel.label : null;
    if (TITLEWINDOW.prefLabel === null) {
      return
    }
    TITLEWINDOW.language = window.SKOSMOS.lang;
    TITLEWINDOW.prefLabel = data.prefLabels[0].label
    const uri = window.SKOSMOS.uri;
    const uriSpace = window.SKOSMOS.uriSpace;
    TITLEWINDOW.identifier = uri.replace(uriSpace, "");
    if (!TITLEWINDOW.identifier) {
      return;
    }
    const queries = [];
    for (field of TITLEWINDOW.lookforFields) {
      const restURL = TITLEWINDOW.generateQueryString(
        TITLEWINDOW.identifier,
        field,
        1,
      );
      const query = TITLEWINDOW.queryFinna(restURL, field);
      queries.push(query);
    }

    Promise.all(queries).then((results) => {
      const resultCounts = [];
      const records = {};
      results.forEach((value, index) => {
        const resultCount = value.results.resultCount;
        resultCounts[index] = resultCount;

        if (resultCount > 0) {
          records[value.label] = [value.results.records];
        }
      });
      const nextQueries = []

      resultCounts.forEach((value, index) => {
        if (value > TITLEWINDOW.maxResults) {
          value = TITLEWINDOW.maxResults;
        }
        if (value > TITLEWINDOW.limit) {
          const queryNumber = Math.ceil(value / TITLEWINDOW.limit);
          for (let i = 2; i <= queryNumber; i++) {
            const field = TITLEWINDOW.lookforFields[index];
            const restURL = TITLEWINDOW.generateQueryString(
              TITLEWINDOW.identifier,
              field,
              i,
            );
            const query = TITLEWINDOW.queryFinna(restURL, field)
            nextQueries.push(query)
          }
        }
      });

      if (nextQueries.length > 0) {
        return Promise.all(nextQueries).then((nextResults) => {
          nextResults.forEach((value) => {
            if (!records[value.label]) records[value.label] = [];
            records[value.label].push(value.results.records);
          });
          TITLEWINDOW.handleQueryResults(records);
          TITLEWINDOW.render();
        });
      } else {
        TITLEWINDOW.handleQueryResults(records);
        TITLEWINDOW.render();
      }
    });
  };
});
