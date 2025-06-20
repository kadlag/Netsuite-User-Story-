/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @Name
*/
define(['N/record'], (record) => {

    const createCustomerDeposit = (salesOrderId, customerId, amount, paymentMethod) => {
        try {
            var deposit = record.create({
                type: record.Type.CUSTOMER_DEPOSIT,
                isDynamic: true
            });

            deposit.setValue({
                fieldId: 'customer',
                value: customerId
            });

            deposit.setValue({
                fieldId: 'salesorder',
                value: salesOrderId
            });

            deposit.setValue({
                fieldId: 'payment',
                value: amount
            });

            deposit.setValue({
                fieldId: 'paymentmethod',
                value: paymentMethod
            });

            var depositId = deposit.save();
            return depositId;

        } catch (e) {
            log.error('Error creating deposit', e);
        }
    }
    const afterSubmit = (scriptContext) => {
        if (scriptContext.type !== scriptContext.UserEventType.CREATE) return;

        try {
            var salesOrd = scriptContext.newRecord;
            var salesOrderId = salesOrd.id;

            log.debug("Sales Order Id", salesOrderId);

            var customerId = salesOrd.getValue({
                fieldId: 'entity'
            })
            log.debug("Customer Id:", customerId);

            var totalAmount = salesOrd.getValue({
                fieldId: 'total'
            })
            log.debug("Total:", totalAmount);

            var paymentMethod = salesOrd.getValue({
                fieldId: 'paymentmethod'
            })

            log.debug("paymentMethod:", paymentMethod);

            if (!customerId && total <= 0) {
                log.debug("Missing Customer or total is zero");
                return;
            }

            const depositId = createCustomerDeposit(salesOrderId, customerId, totalAmount, paymentMethod);
            log.debug("Deposite Id:", depositId);

        } catch (e) {
            log.error('Error creating deposit', e);
        }
    };

    return {
        afterSubmit,
    };
});