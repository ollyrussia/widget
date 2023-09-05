define(['jquery', 'underscore', 'twigjs'], function ($, _, Twig) {
  var CustomWidget = function () {
    var self = this;

    this.getTemplate = _.bind(function (template, params, callback) {
      params = (typeof params == 'object') ? params : {};
      template = template || '';

      return this.render({
        href: '/templates/' + template + '.twig',
        base_path: this.params.path,
        v: this.get_version(),
        load: callback
      }, params);
    }, this);

    function widget_get_psychologist_from_yclients(){
      
      return fetch('https://api.yclients.com/api/v1/company/542516/staff/', {
        method: 'GET',
        headers: {
          "Authorization": "Bearer tzx2jrfxx6cdhxafcb6g, User c912ed93d93fdc1c165456baf618bf07",
          "Accept": "application/vnd.yclients.v2+json",
          "Content-Type": "application/json"
        }
      }).then(response => response.json())
    }

    function widget_get_records_by_id_yclients(id){
      let today = new Date();
      let dd = today.getDate();
      let mm = today.getMonth()+1; 
      let yyyy = today.getFullYear();

      return fetch('https://api.yclients.com/api/v1/records/542516?staff_id='+id+'&start_date='+yyyy+'-'+mm+'-'+dd, {
        method: 'GET',
        headers: {
          "Authorization": "Bearer tzx2jrfxx6cdhxafcb6g, User c912ed93d93fdc1c165456baf618bf07",
          "Accept": "application/vnd.yclients.v2+json",
          "Content-Type": "application/json"
        }
      }).then(response => response.json())
    }

    function widget_delete_free_window_from_yclients(id){
      return fetch('https://api.yclients.com/api/v1/record/542516/'+id, {
        method: 'DELETE',
        headers: {
          "Authorization": "Bearer tzx2jrfxx6cdhxafcb6g, User c912ed93d93fdc1c165456baf618bf07",
          "Accept": "application/vnd.yclients.v2+json",
          "Content-Type": "application/json"
        }
      }).then(response => response)
    }

    this.callbacks = {
      render: function () {

          self.render_template({
            body: '',
            caption: {
              class_name: 'widget-caption-unique-class-name'
            },
            render: '<div class="widget-body-free-slots-yclients"></div>'
        }, {});

        console.log('pre-render');
        return true;
      },
      init: _.bind(function () {
        console.log('init');

        var settings = self.get_settings();
         //   Проверяем подключен ли наш файл css
         console.log('link[href="' + settings.path + '/style.css?v=' + settings.version +'"');
       // if ($('link[href="' + settings.path + '/style.css?v=' + settings.version +'"').length < 1) {
            //  Подключаем файл style.css передавая в качестве параметра версию виджета
            $("head").append('<link href="' + settings.path + '/style.css?v=' + settings.version + '" type="text/css" rel="stylesheet">');
      //  }
        widget_get_psychologist_from_yclients()
            .then((data) => {
              psy_list = data.data;
    
              var template = '<div class="psy-list">' +
                          '{% for psychologist in list %}' +
                            '<div class="psy-card" id="psy-id-{{ psychologist.id }}">' +
                            '<img src="{{ psychologist.avatar }}" width="35" height="35" class="psy-ava"/>'+
                            '<div class="psy-data">'+
                              '<span class="psy-name">{{ psychologist.name }}</span>' +
                              '<span class="psy-spec">{{ psychologist.specialization }}</span>' +
                            '</div></div>' +
                          '{% endfor %}' + 
                          '</div>';
    
              list_html = self.render({data: template}, {list: psy_list}); 
              
              //console.log(list_html); 
              
              $('.widget-body-free-slots-yclients').html(list_html);

              $( ".psy-card" ).bind( "click", function() {

                let ava =  $(this).children("img").attr("src");
                let name =  $(this).find(".psy-name").html();
                let spec =  $(this).find(".psy-spec").html();
                let psy_id = $(this).attr('id').replace('psy-id-', '');

                //alert( "User clicked on 'psy.' with id "+ psy_id+' | '+name+' | '+spec+' | '+ava);
                
                let list_header = '<div class="psy-schedule-header"><div class="back-to-psy-list"></div><div class="psy-schedule-header-data">';
                list_header += '<img class="psy-schedule-ava" src='+ava+' />';
                list_header += '<span class="psy-schedule-name">'+name+'</span>';
                list_header += '<span class="psy-schedule-spec">'+spec+'</span></div>';
                list_header += '</div><div class="psy-schedule-records-list"></div>';
                $('.widget-body-free-slots-yclients').html(list_header);
                
                $( ".back-to-psy-list" ).bind( "click", function() {
                  self.callbacks.init();
                });

                widget_get_records_by_id_yclients(psy_id).then((data) => {
                  console.log(data);

                  records_list = data.data;
    

                  var template = '{% set day_date = "" %}'+
                  '<div class="list-legend"><div class="base-help help-box"></div><span> ПсихоЛогия</span><div class="psychosomatic-help help-box"></div><span> ПсихоСоматика</span></div>' +
                  '{% for record in list|reverse %}' +
                  
                  '{% if (record.services[0].id == 13253375 or record.services[0].id == 13253378) %}'+
                        
                    '{% if record.date|slice(0, 10) == day_date %}'+

                    '{% elseif record.date|slice(0, 10) != day_date %}' +
                        '{% set day_date = record.date|slice(0, 10) %}' +
                        '{% set day = record.date|slice(8, 2) %}' +
                        '{% set month = record.date|slice(5, 2) %}'+

                        '<br><br><div class="schedule-list-text-date">'+
                        '<span>{{ day }} <span class="records-list-month">'+

                            '{% if month == "01" %}' +
                            'Января' +
                            '{% elseif month == "02" %}'+
                            'Февраля' +
                            '{% elseif month == "03" %}' +
                            'Марта' +
                            '{% elseif month == "04" %}'+
                            'Апреля' +
                            '{% elseif month == "05" %}' +
                            'Мая' +
                            '{% elseif month == "06" %}' +
                            'Июня' +
                            '{% elseif month == "07" %}' +
                            'Июля' +
                            '{% elseif month == "08" %}' +
                            'Августа' +
                            '{% elseif month == "09" %}' +
                            'Сентября' +
                            '{% elseif month == "10" %}'+
                            'Октября' +
                            '{% elseif month == "11" %}' +
                            'Ноября' +
                            '{% elseif month == "12" %}' +
                            'Декабря' +
                            '{% endif %}' +
                        '</span></span>'+
                        '</div>'+
                        //'<div class="schedule-list-time-of-day-box">'+
                 
                    '{% else %}' +
             
                    '{% endif %}' +
                  
                  '{% endif %}' +

                  '{% if record.services[0].id == 13253375 %}' +
                            '<div class="psy-base-box date-time-box" id="service-date-{{record.id}}" title="{{ record.services[0].title }}">{{ record.date|slice(10, 6) }}</div>' +
                          '{% endif %}' +
                          '{% if record.services[0].id == 13253378 %}' +
                            '<div class="psychosomatic-box date-time-box" id="service-date-{{record.id}}" title="{{ record.services[0].title }}">{{ record.date|slice(10, 6) }}</div>' +
                  '{% endif %}' +
                  //'</div>'+

                  '{% endfor %}<br><br>';
        
                  records_html = self.render({data: template}, {list: records_list}); 
                  
                  //console.log(list_html); 
                  
                  $('.psy-schedule-records-list').html(records_html);

                  $( ".date-time-box" ).bind( "click", function() {
                      
                      let service_id = $(this).attr('id').replace('service-date-', '');
                      embedded_form = '<div class="back-to-psy-list"></div>'+
                                      '<textarea class="embedded-form-field" name="query" placeholder="Введите запрос клиента"></textarea>'+
                                      '<input class="embedded-form-field" name="name" type="text" placeholder="Введите имя фамилию клиента">'+
                                      //'<input class="embedded-form-field" name="surname" type="text" placeholder="Введите фамилию клиента">'+
                                      //'<input class="embedded-form-field" name="birthdate" type="date" placeholder="Введите дату рождения клиента">'+
                                      '<input class="embedded-form-field" name="email" type="text" placeholder="Введите email клиента">'+
                                      '<input class="embedded-form-field" name="phone" type="text" placeholder="Введите телефон клиента">'+
                                      '<input class="embedded-form-field" name="promo" type="text" placeholder="Введите промокод клиента">'+
                                      '<button class="embedded-form-button" id="binded-to-'+service_id+'">Создать запись</button>';
                    
                      $('.widget-body-free-slots-yclients').html(embedded_form);

                      $( ".back-to-psy-list" ).bind( "click", function() {
                        self.callbacks.init();
                      });
                      $( ".embedded-form-button" ).bind( "click", function() {
                        let id = $(this).attr('id').replace('binded-to-', '');
                        widget_delete_free_window_from_yclients(id).then((data) => {
                             console.log(data);
                        /*  create_new_record_on_yclients().then((data) => {
                             console.log(data);

                          });*/
                          alert('Свободное окно удалено');
                          self.callbacks.init();
                        });
                      });
                  });
                });
              });

            });

        AMOCRM.addNotificationCallback(self.get_settings().widget_code, function (data) {
          console.log(data)
        });

        this.add_action("phone", function (params) {
          /**
           * код взаимодействия с виджетом телефонии
           */
          console.log(params)
        });

        this.add_source("sms", function (params) {
          /**
           params - это объект в котором будут  необходимые параметры для отправки смс

           {
             "phone": 75555555555,   // телефон получателя
             "message": "sms text",  // сообщение для отправки
             "contact_id": 12345     // идентификатор контакта, к которому привязан номер телефона
          }
           */

          return new Promise(_.bind(function (resolve, reject) {
              // тут будет описываться логика для отправки смс
              self.crm_post(
                'https://example.com/',
                params,
                function (msg) {
                  console.log(msg);
                  resolve();
                },
                'text'
              );
            }, this)
          );
        });

        return true;
      }, this),
      bind_actions: function () {
        console.log('bind_actions');
        return true;
      },
      settings: function ( ) {
        return true;
      },
      onSave: function () {
        alert('click');
        return true;
      },
      destroy: function () {

      },
      contacts: {
        //select contacts in list and clicked on widget name
        selected: function () {
          console.log('contacts');
        }
      },
      leads: {
        //select leads in list and clicked on widget name
        selected: function () {
          console.log('leads');
        }
      },
      tasks: {
        //select taks in list and clicked on widget name
        selected: function () {
          console.log('tasks');
        }
      },
      advancedSettings: _.bind(function () {
        var $work_area = $('#work-area-' + self.get_settings().widget_code),
          $save_button = $(
            Twig({ref: '/tmpl/controls/button.twig'}).render({
              text: 'Сохранить',
              class_name: 'button-input_blue button-input-disabled js-button-save-' + self.get_settings().widget_code,
              additional_data: ''
            })
          ),
          $cancel_button = $(
            Twig({ref: '/tmpl/controls/cancel_button.twig'}).render({
              text: 'Отмена',
              class_name: 'button-input-disabled js-button-cancel-' + self.get_settings().widget_code,
              additional_data: ''
            })
          );

        console.log('advancedSettings');

        $save_button.prop('disabled', true);
        $('.content__top__preset').css({float: 'left'});

        $('.list__body-right__top').css({display: 'block'})
          .append('<div class="list__body-right__top__buttons"></div>');
        $('.list__body-right__top__buttons').css({float: 'right'})
          .append($cancel_button)
          .append($save_button);

        self.getTemplate('advanced_settings', {}, function (template) {
          var $page = $(
            template.render({title: self.i18n('advanced').title, widget_code: self.get_settings().widget_code})
          );

          $work_area.append($page);
        });
      }, self),

      /**
       * Метод срабатывает, когда пользователь в конструкторе Salesbot размещает один из хендлеров виджета.
       * Мы должны вернуть JSON код salesbot'а
       *
       * @param handler_code - Код хендлера, который мы предоставляем. Описан в manifest.json, в примере равен handler_code
       * @param params - Передаются настройки виджета. Формат такой:
       * {
       *   button_title: "TEST",
       *   button_caption: "TEST",
       *   text: "{{lead.cf.10929}}",
       *   number: "{{lead.price}}",
       *   url: "{{contact.cf.10368}}"
       * }
       *
       * @return {{}}
       */
      onSalesbotDesignerSave: function (handler_code, params) {
        var salesbot_source = {
            question: [],
            require: []
          },
          button_caption = params.button_caption || "",
          button_title = params.button_title || "",
          text = params.text || "",
          number = params.number || 0,
          handler_template = {
            handler: "show",
            params: {
              type: "buttons",
              value: text + ' ' + number,
              buttons: [
                button_title + ' ' + button_caption,
              ]
            }
          };

        console.log(params);

        salesbot_source.question.push(handler_template);

        return JSON.stringify([salesbot_source]);
      },
    };
    return this;
  };

  return CustomWidget;
});