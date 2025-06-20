/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/query', 'N/record', 'N/file', 'N/runtime'], (query, record, file, runtime) => {

    const getInputData = () => {
        const sqlQuery = `
            SELECT
                i.id AS itemId,
                i.itemid AS itemName,
                i.displayname,
                i.description,
                BUILTIN.DF(i.subsidiary) AS subsidiaryName,
                BUILTIN.DF(i.location) AS locationName,
                i.averageCost,
                i.lastPurchasePrice,
                i.totalValue,
                i.custitem_manual_cost_item,
                BUILTIN.DF(i.custitem_bits_quality) AS quality,
                BUILTIN.DF(i.custitem_bits_parent) AS parent,
                i.custitem_quantity_availabel,
                BUILTIN.DF(ail.location) AS aggregateLocation,
                ail.quantityOnHand,
                ail.quantityAvailable,
                ail.quantityOnOrder,
                ail.quantityCommitted,
                ail.quantityBackOrdered,
                ail.quantityInTransit
            FROM
                item i
            JOIN
                aggregateItemLocation ail ON ail.item = i.id
        `;

        const runQuery = query.runSuiteQL({ query: sqlQuery });
        const queryResult = runQuery.asMappedResults();
        // log.debug("Query Result Count", queryResult.length);

        return queryResult;
    };

    const map = (mapContext) => {
        const result = JSON.parse(mapContext.value);

        const inventoryData = {
            itemId: result.itemid || '',
            itemName: result.itemname || '',
            displayName: result.displayname || '',
            description: result.description || '',
            subsidiaryName: result.subsidiaryname || '',
            locationName: result.locationname || '',
            averageCost: result.averagecost || 0,
            lastPurchasePrice: result.lastpurchaseprice || 0,
            totalValue: result.totalvalue || 0,
            manualCostItem: result.custitem_manual_cost_item || '',
            quality: result.quality || '',
            parent: result.parent || '',
            quantityAvailable: result.custitem_quantity_availabel || 0,
            aggregateLocation: result.aggregatelocation || '',
            quantityOnHand: result.quantityonhand || 0,
            quantityAvailables: result.quantityavailable || 0,
            quantityOnOrder: result.quantityonorder || 0,
            quantityCommitted: result.quantitycommitted || 0,
            quantityBackordered: result.quantitybackordered || 0,
            quantityIntransit: result.quantityintransit || 0
        }

        mapContext.write({
            key: result.itemid,
            value: JSON.stringify(inventoryData)
        });
    };

    const reduce = (reduceContext) => {

        reduceContext.values.forEach(value => {
            const data = JSON.parse(value);
            const content = `${data.itemId},${data.itemName},${data.displayName},${data.description},${data.subsidiaryName},${data.locationName},${data.averageCost},${data.lastPurchasePrice},${data.totalValue},${data.manualCostItem},${data.quality},${data.parent},${data.quantityAvailable},${data.aggregateLocation},${data.quantityOnHand},${data.quantityAvailables},${data.quantityOnOrder},${data.quantityCommitted},${data.quantityBackordered},${data.quantityIntransit} \n`;
            reduceContext.write({
                key: data.itemId,
                value: content
            })
        });
    };

    const summarize = (summaryContext) => {

        let fileLines = 'Item Id,Item Name,Display Name,description,subsidiaryName,locationName,averageCost,lastPurchasePrice,totalValue,manualCostItem,quality,parent,quantityAvailable,Aggregate Location,Quantity on hand ,Quqntity Availables ,quantityOnOrder,quantityCommitted,quantityBackordered,quantityIntransit\n';
        summaryContext.output.iterator().each((key, value) => {
            fileLines += value;
            return true;
        });

        const fileObj = file.create({
            name: 'Inventory_Items_Data.csv',
            fileType: file.Type.CSV,
            folder: 727,
            contents: fileLines
        });
        try {
            const fileId = fileObj.save();
            log.debug('File Saved Successfully', { fileId });
        } catch (e) {
            log.error({ title: 'FILE_SAVE_ERROR', details: e });
        }
    };

    return {
        getInputData,
        map,
        reduce,
        summarize
    };
});
