/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */

define(['N/record', 'N/log', 'N/runtime', 'N/task'],
  (record, log, runtime, task) => {
    const execute = (context) => {
      try {

        var scheduledTask = task.create({
          taskType: task.TaskType.SCHEDULED_SCRIPT,
          scriptId: 'customscript_bits_sc_create_so_record', //create sales order script id
          deploymentId: 'customdeploy_bits_sc_create_sales_order' //create sales order deployment id
        })

        const scheduledTaskId = scheduledTask.submit();

        log.debug("Scheduled Task Id:", scheduledTaskId);

        var taskStatus = task.checkStatus(scheduledTaskId);

        log.debug("Status:", taskStatus.status);

      } catch (e) {
        log.error({ title: 'Error', details: e });

      }
    }
    return {
      execute
    };
  });