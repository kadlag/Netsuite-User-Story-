/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/ui/serverWidget', 'N/query', 'N/url', 'N/runtime', 'N/record'], function (serverWidget, query, url, runtime, record) {

    function createForm() {
        return serverWidget.createForm({
            title: 'Item Details Form'
        });
    }

    function addItemFields(form, selectedType) {
        addStep1ItemFields(form);
        addStep2ItemTypeField(form, selectedType);
    }

    function addStep1ItemFields(form) {
        form.addFieldGroup({
            id: 'bits_item_number',
            label: 'Step 1: Enter Item Number'
        });

        form.addField({
            id: 'custpage_item_name',
            type: serverWidget.FieldType.TEXT,
            label: 'Item Name',
            container: 'bits_item_number'
        }).isMandatory = true;

        form.addField({
            id: 'custpage_display_name',
            type: serverWidget.FieldType.TEXT,
            label: 'Display Name/CODE',
            container: 'bits_item_number'
        }).isMandatory = true;

        form.addField({
            id: 'custpage_tax_schedule',
            type: serverWidget.FieldType.SELECT,
            label: 'Tax Schedule',
            source: 'customlist_bits_tax_schedule',
            container: 'bits_item_number'
        });
    }

    function addStep2ItemTypeField(form, selectedType) {
        form.addFieldGroup({
            id: 'bits_item_type',
            label: 'Step 2: Select Item Type'
        });

        var itemTypeField = form.addField({
            id: 'custpage_item_type',
            type: serverWidget.FieldType.SELECT,
            label: 'Item Type',
            source: 'itemType',
            container: 'bits_item_type'
        });

        log.debug("Selected type", selectedType);
        itemTypeField.defaultValue = selectedType;
    }

    function addItemSublist(form, selectedType) {
        var sublist = form.addSublist({
            id: 'bits_item_sublist',
            type: serverWidget.SublistType.LIST,
            label: 'Available Template List'
        });

        sublist.addField({
            id: 'custpage_select',
            type: serverWidget.FieldType.TEXT,
            label: 'Select'
        });

        sublist.addField({
            id: 'custpage_item_record_type',
            type: serverWidget.FieldType.TEXT,
            label: 'Item Record Type'
        });

        sublist.addField({
            id: 'custpage_sublist_item_name',
            type: serverWidget.FieldType.TEXT,
            label: 'Item Name'
        });

        sublist.addField({
            id: 'custpage_sublist_item_display_name',
            type: serverWidget.FieldType.TEXT,
            label: 'Display Name'
        });

        sublist.addField({
            id: 'custpage_item_type',
            type: serverWidget.FieldType.TEXT,
            label: 'Item Type'
        });

        if (selectedType) {
            var results = getFilteredItemsByType(selectedType);
            populateSublist(sublist, results, selectedType);
        }
    }

    function getFilteredItemsByType(itemTypeId) {

        const itemTypeMap = {
            '1': 'InvtPart',
            '2': 'NonInvtPart',
            '3': 'Service',
            '4': 'OthCharge',
            '6': 'Kit',
            '7': 'Group',
            '8': 'Discount',
            '12': 'Payment',
        };

        const itemTypeName = itemTypeMap[itemTypeId];
        log.debug("Item Type Name:", itemTypeName);
        let sql = `
        SELECT 
        id,
        itemid,
        displayname,
        itemtype
        FROM item 
        where itemtype = '${itemTypeName}'
        ORDER BY itemid
    `;


        let results = query.runSuiteQL({ query: sql }).asMappedResults();
        return results || [];
    }

    function populateSublist(sublist, items, itemType) {
        for (let i = 0; i < items.length; i++) {
            sublist.setSublistValue({
                id: 'custpage_select',
                line: i,
                value: items[i].id.toString()
            });

            sublist.setSublistValue({
                id: 'custpage_item_record_type',
                line: i,
                value: itemType
            });

            sublist.setSublistValue({
                id: 'custpage_sublist_item_name',
                line: i,
                value: items[i].itemid.toString()
            });

            sublist.setSublistValue({
                id: 'custpage_sublist_item_display_name',
                line: i,
                value: items[i].displayname
            });

            sublist.setSublistValue({
                id: 'custpage_item_type',
                line: i,
                value: items[i].itemtype
            });
        }
    }

    function createItem(request) {

        const itemName = request.parameters.custpage_item_name;
        const displayName = request.parameters.custpage_display_name;
        const taxSchedule = request.parameters.custpage_tax_schedule;
        const itemTypeId = request.parameters.custpage_item_type;

        const itemRecordTypeMap = {
            '1': 'inventoryitem',
            '2': 'noninventoryitem',
            '3': 'serviceitem',
            '4': 'otherchargeitem',
            '6': 'kititem',
            '7': 'itemgroup',
            '8': 'discountitem',
            '12': 'paymentitem'
        };

        const recordType = itemRecordTypeMap[itemTypeId];

        var itemRecord = record.create({
            type: recordType,
            isDynamic: true
        });

        itemRecord.setValue({
            fieldId: 'itemid',
            value: itemName
        })

        itemRecord.setValue({
            fieldId: 'displayname',
            value: displayName
        })

        if (taxSchedule) {
            itemRecord.setValue({
                fieldId: 'taxschedule',
                value: taxSchedule
            })
        }

        var itemId = itemRecord.save();
        log.debug('Item created successfully', 'itemId: ' + itemId);

    }
    function onRequest(scriptContext) {
        var request = scriptContext.request;
        var selectedItemType = request.parameters.custpage_item_type || '';

        var form = createForm();
        form.clientScriptModulePath = './bits_cs_create_item.js';

        addItemFields(form, selectedItemType);
        addItemSublist(form, selectedItemType);

        form.addSubmitButton({
            label: 'Create Item'
        });

        scriptContext.response.writePage(form);

        if (request.method === 'POST') {
            createItem(request);
        }
    }
    
    return {
        onRequest: onRequest
    };
});
