/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */

define(['N/record', 'N/log', 'N/runtime', 'N/task'],
  (record, log, runtime, task) => {
    const execute = (context) => {
      try {
         const searchId = runtime.getCurrentScript().getParameter({
            name:''
        });

        var mapReduceTask = task.create({
          taskType: task.TaskType.MAP_REDUCE,
          scriptId: '', 
          deploymentId: '',

           params: {
                    custscript_saved_search_id: searchId
                }
        })

        const mapReduceTaskId = mapReduceTask.submit();

        log.debug("Map Reduce Task Id:", mapReduceTaskId);

        

      } catch (e) {
        log.error({ title: 'Error', details: e });

      }
    }
    return {
      execute
    };
  });