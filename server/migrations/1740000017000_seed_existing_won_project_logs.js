export const shorthands = undefined;

export function up(pgm) {
  pgm.sql(`
    insert into won_project_logs (
      won_project_id,
      log_type,
      title,
      body,
      progress_rate,
      health_status,
      next_action
    )
    select
      wp.id,
      'created',
      '초기 수행 현황 등록',
      '기존 수행 사업 가데이터에 대한 초기 진행 로그입니다.',
      case
        when wp.actual_man_months is not null and wp.planned_man_months is not null and wp.planned_man_months > 0
          then least(100, greatest(0, round((wp.actual_man_months / wp.planned_man_months) * 100)::int))
        when wp.status = 'completed' then 100
        when wp.status = 'preparing' then 10
        else 50
      end,
      case when wp.status = 'atRisk' then 'risk' else 'normal' end,
      case when wp.status = 'completed' then '최종 검수 결과 확인' else '월간 수행 점검 및 산출물 상태 확인' end
    from won_projects wp
    where not exists (
      select 1
      from won_project_logs l
      where l.won_project_id = wp.id
    )
  `);
}

export function down(pgm) {
  pgm.sql(`
    delete from won_project_logs
    where title = '초기 수행 현황 등록'
      and body = '기존 수행 사업 가데이터에 대한 초기 진행 로그입니다.'
  `);
}
