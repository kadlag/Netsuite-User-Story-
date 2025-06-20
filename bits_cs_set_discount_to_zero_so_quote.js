/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */
define(['N/currentRecord', 'N/record','N/search'], (currentRecord, record ,search) => {

    function fieldChanged(scriptContext) {
        if (scriptContext.sublistId === 'item' && scriptContext.fieldId === 'item') {
            const currentRec = currentRecord.get();
            const itemId = currentRec.getCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'item'
            });

            console.log("Item Id:", itemId);
            const discountFieldId = 'custcol_bits_discount_percent';

            try {
                if (itemId) {
                    const itemData = search.lookupFields({
                        type: search.Type.INVENTORY_ITEM,
                        id: itemId,
                        columns: ['custitem_bits_fixed_price']
                    });

                    const fixedPrice = itemData.custitem_bits_fixed_price;

                    console.log("Fixed Price:", fixedPrice);
                    const discountField = currentRec.getCurrentSublistField({
                        sublistId: 'item',
                        fieldId: discountFieldId
                    });

                    if (fixedPrice && discountField) {
                        currentRec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: discountFieldId,
                            value: 0,
                            ignoreFieldChange: true
                        });

                        discountField.isDisabled = true;
                    } else if (discountField) {
                        discountField.isDisabled = false;
                    }
                } else {
                    const discountField = currentRec.getCurrentSublistField({
                        sublistId: 'item',
                        fieldId: discountFieldId
                    });
                    discountField.isDisabled = false;
                }
            } catch (e) {
                console.error('Error:', e);
            }
        }
    }

    return {
        fieldChanged
    };
});
