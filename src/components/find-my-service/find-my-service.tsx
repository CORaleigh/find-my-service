import { Component, Prop, h, State } from '@stencil/core';
import { loadModules } from 'esri-loader';
@Component({
    tag: 'find-my-service',
    styleUrl: 'find-my-service.css',
    shadow: false
})
export class FindMyService {
    @Prop() categories: string;
    @State() webmaps: any[] = [];
    @State() maps: any[] = [];
    features: any[] = [];
    search: any;
    initializeMap() {
        loadModules(['esri/portal/Portal', 'esri/widgets/Search', 'esri/WebMap', 'esri/layers/FeatureLayer']).then(([Portal, Search, WebMap, FeatureLayer]) => {
            this.search = new Search({
                container: 'searchDiv', includeDefaultSources: false,
                sources: [
                    {
                        layer: new FeatureLayer({ url: "https://maps.raleighnc.gov/arcgis/rest/services/Addresses/MapServer/2" }),
                        displayField: "ADDRESS",
                        name: "Search by address",
                        placeholder: "Search by address",
                        outFields: ['ADDRESS'],
                        maxResults: 1,
                        maxSuggestions: 6,
                        suggestionsEnabled: true,
                        minSuggestCharacters: 0
                    }
                ]
            });
            this.search.on('select-result', (selection) => {
                this.maps = [...[]];
                let maps = [...[]];
                new FeatureLayer({ url: "https://maps.raleighnc.gov/arcgis/rest/services/Planning/Jurisdictions/MapServer/0" }).queryFeatureCount({
                    geometry: selection.result.feature.geometry, outFields: ['*'],
                    where: "LONG_NAME = 'RALEIGH'"
                }).then((count: number) => {
                    this.webmaps.forEach((map: any) => {
                        if (map.portalItem.title.includes('Leaf') && count === 0) {
                            console.log('Leaf collection not available outside city limits');
                        } else {

                            let featureCnt = 0;
                            let layers = [...[]];
                            map.layers.forEach((layer) => {
                                layer.queryFeatures({ geometry: selection.result.feature.geometry, outFields: ['*'] }).then(featureSet => {
                                    layers = [...layers, { title: layer.title, features: featureSet.features, id: layer.id }]
                                    featureCnt += featureSet.features.length;
                                    if (layers.length === map.layers.length) {
                                        layers.sort((a, b) => {
                                            if (a.title < b.title) {
                                                return -1
                                            }
                                            if (a.title > b.title) {
                                                return 0;
                                            }
                                        })
                                        maps = [...maps, { title: map.portalItem.title, featureCnt: featureCnt, layers: layers }]
                                    }
                                    if (maps.length === this.webmaps.length) {
                                        maps.sort((a, b) => {
                                            if (a.title < b.title) {
                                                return -1
                                            }
                                            if (a.title > b.title) {
                                                return 0;
                                            }
                                        });
                                        this.maps = [...maps];
                                    }
                                });
                            });
                        }

                    });
                });
            });
            const portal = new Portal();
            portal.load().then(() => {
                let queryParams = {
                    query: 'id: a8acaca3d4514d40bc7f302a8db291fb',
                    sortField: 'title'
                };
                portal.queryGroups(queryParams).then(result => {
                    if (result.results.length) {
                        queryParams = {
                            query: 'type: map',
                            sortField: 'title'
                        };
                        let categories = [];
                        if (this.categories) {
                            categories = this.categories.split(',');
                        }
                        result.results[0].queryItems(queryParams).then(result => {
                            if (result.results.length) {
                                result.results.forEach(item => {
                                    console.log(categories);
                                    if (categories.length === 0 || categories.includes(item.title)) {
                                        new WebMap({ portalItem: { id: item.id } }).loadAll().then(map => {
                                            map.layers.items.forEach((layer) => {
                                                layer.features = [];
                                            })
                                            map.featureCnt = 0;
                                            this.webmaps.push(map);
                                            if (this.webmaps.length === result.results.length) {
                                                console.log(result.results);
                                                console.log(WebMap);
                                                this.webmaps = [...this.webmaps];
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            });
        });
    }
    componentDidLoad() {
        this.webmaps = [];
        this.initializeMap();
    }
    componentWillLoad() {
        if (this.search) {
            this.search.destroy();
        }
        document.getElementById('searchDiv').innerHTML = '';
        this.maps = [...[]];
    }
    loadFeatureWidget(id, feature) {
        loadModules(['esri/widgets/Feature']).then(([Feature]) => {
            let widget = new Feature({ container: id });
            widget.graphic = feature;
        });
    }
    render() {
        return (<div><div id='searchDiv'></div><div>{this.maps.map((webmap) => {
            return webmap.featureCnt > 0 ? <div><h3>{webmap.title}</h3>
                <div>{webmap.layers.map((layer) => {
                    return layer.features.length > 0 ? <div>
                        <div>{layer.features.map((feature, i) => {
                            return <div><div id={layer.id + '_' + i}>{this.loadFeatureWidget(layer.id + '_' + i, feature)}</div><br /></div>
                        })}</div></div>
                        : <div></div>
                })}
                </div></div>
                : <div></div>
        })}</div></div>);
    }
}
