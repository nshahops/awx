/*************************************************
 * Copyright (c) 2015 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/

import adhoc from './adhoc/main';
import host from './hosts/main';
import group from './groups/main';
import sources from './sources/main';
import relatedHost from './related-hosts/main';
import inventoryCompletedJobs from './completed_jobs/main';
import inventoryAdd from './add/main';
import inventoryEdit from './edit/main';
import inventoryList from './list/main';
import hostGroups from './host-groups/main';
import { templateUrl } from '../shared/template-url/template-url.factory';
import { N_ } from '../i18n';
import InventoryList from './inventory.list';
import InventoryForm from './inventory.form';
import InventoryManageService from './inventory-manage.service';
import adHocRoute from './adhoc/adhoc.route';
import ansibleFacts from './ansible_facts/main';
import insights from './insights/main';
import { copyMoveGroupRoute, copyMoveHostRoute } from './copy-move/copy-move.route';
import copyMove from './copy-move/main';
import inventoryCompletedJobsRoute from './completed_jobs/completed_jobs.route';
import inventorySourceEditRoute from './sources/edit/sources-edit.route';
import inventorySourceAddRoute from './sources/add/sources-add.route';
import inventorySourceListRoute from './sources/list/sources-list.route';
import inventorySourceListScheduleRoute from './sources/list/schedule/sources-schedule.route';
import inventorySourceListScheduleAddRoute from './sources/list/schedule/sources-schedule-add.route';
import inventorySourceListScheduleEditRoute from './sources/list/schedule/sources-schedule-edit.route';
import inventoryAdhocCredential from './adhoc/adhoc-credential.route';
import inventoryGroupsList from './groups/list/groups-list.route';
import inventoryGroupsAdd from './groups/add/groups-add.route';
import inventoryGroupsEdit from './groups/edit/groups-edit.route';
import nestedGroups from './groups/nested-groups/nested-groups.route';
import nestedGroupsAdd from './groups/nested-groups/nested-groups-add.route';
import nestedHosts from './groups/nested-hosts/nested-hosts.route';
import inventoryHosts from './related-hosts/related-host.route';
import inventoriesList from './inventories.route';
import inventoryHostsAdd from './related-hosts/add/host-add.route';
import inventoryHostsEdit from './related-hosts/edit/host-edit.route';
import nestedHostsAdd from './groups/nested-hosts/nested-hosts-add.route';
import nestedHostsEdit from './groups/nested-hosts/nested-hosts-edit.route';
import ansibleFactsRoute from './ansible_facts/ansible_facts.route';
import insightsRoute from './insights/insights.route';
import hostGroupsRoute from './host-groups/host-groups.route';
import hostGroupsAssociateRoute from './host-groups/host-groups-associate/host-groups-associate.route';

export default
angular.module('inventory', [
        adhoc.name,
        host.name,
        group.name,
        sources.name,
        relatedHost.name,
        inventoryCompletedJobs.name,
        inventoryAdd.name,
        inventoryEdit.name,
        inventoryList.name,
        ansibleFacts.name,
        insights.name,
        copyMove.name,
        hostGroups.name
    ])
    .factory('InventoryForm', InventoryForm)
    .factory('InventoryList', InventoryList)
    .service('InventoryManageService', InventoryManageService)
    .config(['$stateProvider', 'stateDefinitionsProvider', '$stateExtenderProvider',
        function($stateProvider, stateDefinitionsProvider, $stateExtenderProvider) {
            let stateDefinitions = stateDefinitionsProvider.$get(),
            stateExtender = $stateExtenderProvider.$get();

            function generateInventoryStates() {

                let basicInventoryAdd = stateDefinitions.generateTree({
                    name: 'inventories.add', // top-most node in the generated tree (will replace this state definition)
                    url: '/basic_inventory/add',
                    modes: ['add'],
                    form: 'InventoryForm',
                    controllers: {
                        add: 'InventoryAddController'
                    }
                });

                let basicInventoryEdit = stateDefinitions.generateTree({
                    name: 'inventories.edit',
                    url: '/basic_inventory/:inventory_id',
                    modes: ['edit'],
                    form: 'InventoryForm',
                    controllers: {
                        edit: 'InventoryEditController'
                    },
                    breadcrumbs: {
                        edit: '{{breadcrumb.inventory_name}}'
                    }
                });

                let smartInventoryAdd = stateDefinitions.generateTree({
                    name: 'inventories.addSmartInventory', // top-most node in the generated tree (will replace this state definition)
                    url: '/smart_inventory/add?hostfilter',
                    modes: ['add'],
                    form: 'SmartInventoryForm',
                    controllers: {
                        add: 'SmartInventoryAddController'
                    }
                });

                let smartInventoryEdit = stateDefinitions.generateTree({
                    name: 'inventories.editSmartInventory',
                    url: '/smart_inventory/:inventory_id',
                    modes: ['edit'],
                    form: 'SmartInventoryForm',
                    controllers: {
                        edit: 'SmartInventoryEditController'
                    }
                });

                let inventoryGroupsEditNestedGroups = _.cloneDeep(nestedGroups);
                inventoryGroupsEditNestedGroups.name = "inventories.edit.groups.edit.nested_groups";
                inventoryGroupsEditNestedGroups.ncyBreadcrumb = {
                    parent: "inventories.edit.groups.edit",
                    label: "ASSOCIATED GROUPS"
                };

                let inventoryGroupsEditNestedHostsEditGroups = _.cloneDeep(nestedGroups);
                inventoryGroupsEditNestedHostsEditGroups.name = "inventories.edit.groups.edit.nested_hosts.edit.nested_groups";
                inventoryGroupsEditNestedHostsEditGroups.ncyBreadcrumb = {
                    parent: "inventories.edit.groups.edit.nested_hosts.edit",
                    label: "ASSOCIATED GROUPS"
                };

                let inventoryHostsEditGroups = _.cloneDeep(nestedGroups);
                inventoryHostsEditGroups.name = "inventories.edit.hosts.edit.nested_groups";
                inventoryHostsEditGroups.ncyBreadcrumb = {
                    parent: "inventories.edit.hosts.edit",
                    label: "ASSOCIATED GROUPS"
                };

                let relatedHostsAnsibleFacts = _.cloneDeep(ansibleFactsRoute);
                relatedHostsAnsibleFacts.name = 'inventories.edit.hosts.edit.ansible_facts';

                let nestedHostsAnsibleFacts = _.cloneDeep(ansibleFactsRoute);
                nestedHostsAnsibleFacts.name = 'inventories.edit.groups.edit.nested_hosts.edit.ansible_facts';

                let relatedHostsInsights = _.cloneDeep(insightsRoute);
                relatedHostsInsights.name = 'inventories.edit.hosts.edit.insights';

                let nestedHostsInsights = _.cloneDeep(insightsRoute);
                nestedHostsInsights.name = 'inventories.edit.groups.edit.nested_hosts.edit.insights';

                return Promise.all([
                    basicInventoryAdd,
                    basicInventoryEdit,
                    smartInventoryAdd,
                    smartInventoryEdit
                ]).then((generated) => {
                    return {
                        states: _.reduce(generated, (result, definition) => {
                            return result.concat(definition.states);
                        }, [
                            stateExtender.buildDefinition(inventoriesList),
                            stateExtender.buildDefinition(adHocRoute),
                            stateExtender.buildDefinition(inventoryAdhocCredential),
                            stateExtender.buildDefinition(inventorySourceListScheduleRoute),
                            stateExtender.buildDefinition(inventorySourceListScheduleAddRoute),
                            stateExtender.buildDefinition(inventorySourceListScheduleEditRoute),
                            stateExtender.buildDefinition(relatedHostsAnsibleFacts),
                            stateExtender.buildDefinition(nestedHostsAnsibleFacts),
                            stateExtender.buildDefinition(relatedHostsInsights),
                            stateExtender.buildDefinition(nestedHostsInsights),
                            stateExtender.buildDefinition(copyMoveGroupRoute),
                            stateExtender.buildDefinition(copyMoveHostRoute),
                            stateExtender.buildDefinition(inventoryGroupsList),
                            stateExtender.buildDefinition(inventoryGroupsAdd),
                            stateExtender.buildDefinition(inventoryGroupsEdit),
                            stateExtender.buildDefinition(inventoryGroupsEditNestedGroups),
                            stateExtender.buildDefinition(nestedGroupsAdd),
                            stateExtender.buildDefinition(nestedHosts),
                            stateExtender.buildDefinition(nestedHostsAdd),
                            stateExtender.buildDefinition(nestedHostsEdit),
                            stateExtender.buildDefinition(inventoryGroupsEditNestedHostsEditGroups),
                            stateExtender.buildDefinition(inventoryHosts),
                            stateExtender.buildDefinition(inventoryHostsAdd),
                            stateExtender.buildDefinition(inventoryHostsEdit),
                            stateExtender.buildDefinition(inventoryHostsEditGroups),
                            stateExtender.buildDefinition(inventorySourceListRoute),
                            stateExtender.buildDefinition(inventorySourceAddRoute),
                            stateExtender.buildDefinition(inventorySourceEditRoute),
                            stateExtender.buildDefinition(inventoryCompletedJobsRoute)
                        ])
                    };
                });

            }

            let generateHostStates = function(){
                let hostTree = stateDefinitions.generateTree({
                    parent: 'hosts', // top-most node in the generated tree (will replace this state definition)
                    modes: ['edit'],
                    list: 'HostsList',
                    form: 'HostsForm',
                    controllers: {
                        list: 'HostListController',
                        edit: 'HostEditController'
                    },
                    breadcrumbs: {
                        edit: '{{breadcrumb.host_name}}'
                    },
                    urls: {
                        list: '/hosts'
                    },
                    resolve: {
                        edit: {
                            host: ['Rest', '$stateParams', 'GetBasePath',
                                function(Rest, $stateParams, GetBasePath) {
                                    let path = GetBasePath('hosts') + $stateParams.host_id;
                                    Rest.setUrl(path);
                                    return Rest.get();
                                }
                            ]
                        }
                    },
                    ncyBreadcrumb: {
                        label: N_('HOSTS')
                    },
                    views: {
                        '@': {
                            templateUrl: templateUrl('inventories/inventories')
                        },
                        'list@hosts': {
                            templateProvider: function(HostsList, generateList) {
                                let html = generateList.build({
                                    list: HostsList,
                                    mode: 'edit'
                                });
                                return html;
                            },
                            controller: 'HostListController'
                        }
                    }
                });

                let hostAnsibleFacts = _.cloneDeep(ansibleFactsRoute);
                hostAnsibleFacts.name = 'hosts.edit.ansible_facts';

                let hostInsights = _.cloneDeep(insightsRoute);
                hostInsights.name = 'hosts.edit.insights';

                return Promise.all([
                    hostTree
                ]).then((generated) => {
                    return {
                        states: _.reduce(generated, (result, definition) => {
                            return result.concat(definition.states);
                        }, [
                            stateExtender.buildDefinition(hostAnsibleFacts),
                            stateExtender.buildDefinition(hostInsights),
                            stateExtender.buildDefinition(hostGroupsRoute),
                            stateExtender.buildDefinition(hostGroupsAssociateRoute)
                        ])
                    };
                });
            };

            $stateProvider.state({
                name: 'hosts',
                url: '/hosts',
                lazyLoad: () => generateHostStates()
            });

            $stateProvider.state({
                name: 'inventories',
                url: '/inventories',
                lazyLoad: () => generateInventoryStates()
            });
        }
    ]);
