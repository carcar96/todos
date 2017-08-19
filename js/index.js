var taskList = [];
var checkList = [];
var $input = $('#val');
var $oForm = $('form');
var $ul = $('.box .task-box ul');
var timer=null;

init();
function init(){
	taskList=[];
	checkList=[];
	var get = store.get('task');
	var check = store.get('status');
	if(!get || !check) return;

	for(var i=0;i<get.length;i++){
		taskList.push(get[i]);
	}
	for(var i=0;i<check.length;i++){
		checkList.push(check[i]);
	}
	createHtml();
	clock_time();
}

//是表单绑定事件，不是submit按钮
$oForm.on('submit',function(ev){
	ev.preventDefault();	//阻止表单提交
	var value = $input.val();
	if(value == '') return;

	var obj = {};
	obj.title = value;

	taskList.unshift(obj);
	checkList.unshift(false);//key
	
	store.set('task', taskList);
	store.set('status', checkList);

	$input.val('');	
	createHtml();
})

//生成html
function createHtml(){
	$ul.html('');
	for(var i=0;i<taskList.length;i++){
		var $str = bindData(taskList[i],i);
		$ul.append($str);
	}
	option();
	dele();
	detail();
	pause();
}

//选中checked
function option(){
	if(!checkList) return;
	for(var i=0;i<checkList.length;i++){
		if(checkList[i]){
			$ul.find('li').eq(i).children('input').attr("checked",checkList[i]);
			$ul.find('li').eq(i).css('opacity','0.35');			
		}else{			
			clock_time($ul.children('li').eq(i))
		}
	}
}

//绑定数据
function bindData(data,i){
	var str = '	<li index='+i+'>'+
					'<input type="checkbox" class="option">'+
					'<span>'+data.title+'</span>'+
					'<a class="delete-btn" href="javascript:;">删除</a>'+
					'<a class="detail-btn" href="javascript:;">详细</a>'+
				'</li>'
	return str
}

//阻止冒泡
$('.dele').click(function(ev){
	ev.stopPropagation();
})
var index;
//点击删除
function dele(){
	$('.delete-btn').each(function(idx,ele){	
		$(ele).click(function(ev){		
			$('.warn-box').css('display','block');	
			index=idx;			
		})
	})
}

//确认删除
$('.enter').click(function(){
	$('.warn-box').css('display','none');
	taskList.splice(index,1);
	checkList.splice(index,1);
	store.set('task', taskList);
	store.set('status', checkList);
	init();
})
//取消删除，返回
$('.back').click(function(){
	$('.warn-box').css('display','none');
})

//确认div
$('.warn-box').click(function(ev){
	$('.warn-box').css('display','none');
})

//阻止冒泡
$('.detail').click(function(ev){
	ev.stopPropagation();
})
//修改详情
function detail(){
	$('.detail-btn').each(function(idx,ele){	
		$(ele).on('click',function(){		
			$('.detail_box').css('display','block');
			edit(idx);
		})
	})
}
//编辑
var detail_c='';
function edit(idx){
	index=idx;	//key	
	detail_c = taskList[index].detail;
	$('.detail>h3').html(taskList[index].title);
	$('#datetimepicker6').val(taskList[index].time);
	$('.detail>.content').val(detail_c);

	$('.content').change(function(ev){
		detail_c = ev.currentTarget.value;		
	})
}

//双击修改
$('.detail >h3').dblclick(function(ev){
	var $that = $(this);
	$(this).css('display','none');
	$('.detail .modify').css('display','block');
	$('.detail .modify').focus();
	$('.detail .modify').blur(function(ev){
		$that.css('display','block');
		$(this).css('display','none');
		var val = ev.currentTarget.value;
		if(!val) return;
		$that.html(val);
	})
})

//更新事件
$('.reload').on('click',function(e){
	var time = $('#datetimepicker6').val();
	var title = $('.detail >h3').html();

	taskList[index] = {
		detail:detail_c,
		time:time,
		title:title
	}

	store.set('task', taskList);
	$('.detail_box').css('display','none');
	init();
})


//闹铃处理
function ring(obj){
    //1.获取 start_time=  当前的时间
    var start_time=new Date().getTime()/1000;
    var $item=taskList;
    for(var i=0; i<$item.length; i++){
        //2.过滤
        if (checkList[i] || !$item[i].time) continue;

        //3.end_time= 结束时间
        var end_time=(new Date($item[i].time)).getTime()/1000;

        if (end_time - start_time <=1){
            clearInterval($(obj)[0].timer);                
        }
    	//console.log(Math.floor(end_time - start_time));
    }
}


//开闹钟
function clock_time(obj){
    if (!$(obj)[0]) return;

    clearInterval($(obj)[0].timer);
    $(obj)[0].timer=setInterval(function(){
    	 ring(obj);
    	 
    },1000);
}

function close(){
	//关闭单个闹钟
	$('.timeout').find('h4').each(function(idx,ele){
		$(ele).click(function(){
			$(this).remove();
			if($('.timeout').find('h4').length == 0){
				$('.timeout').css('display','none');
			}
		})
	})
	//关闭全部
	$('.closeAll').click(function(){
		$('.timeout').find('h4').remove();
		$('.timeout').css('display','none');
	})
}


//修改div
$('.detail_box').click(function(ev){
	$('.detail_box').css('display','none');
})

//取消事件
function pause(){
	$('.option').each(function(idx,ele){
		$(ele).click(function(){
			var element = taskList.splice(idx,1);			
			var state = checkList.splice(idx,1);

			if(!state[0]){
				checkList.push(!state[0])
				taskList.push(element[0]);
			}else{
				checkList.unshift(!state[0])
				taskList.unshift(element[0]);
			}

			store.set('task', taskList);
			store.set('status', checkList);

			init();
		})
	})
}