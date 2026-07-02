import type { ApiResponse } from '../api/apiResponse';
import type { JobDetail, JobList } from '../types/job';

export const mockJobsResponse: ApiResponse<JobList> = {
  success: true,
  data: {
    total: 6,
    summary: {
      open: 4,
      closingSoon: 2,
      awarded: 1,
      avgRfpScore: 87
    },
    items: [
      {
        id: 'job-001',
        noticeNumber: 'BID-2026-0142',
        title: '차세대 전자조달 플랫폼 고도화 사업',
        agency: '조달청',
        category: '정보시스템 구축',
        budget: 1280000000,
        publishedAt: '2026-06-18',
        deadline: '2026-07-05',
        status: 'open',
        rfpScore: 92,
        recommendedPeople: 20
      },
      {
        id: 'job-002',
        noticeNumber: 'BID-2026-0138',
        title: '공공기관 데이터 표준화 및 API 연계 사업',
        agency: '행정안전부',
        category: '데이터 플랫폼',
        budget: 740000000,
        publishedAt: '2026-06-17',
        deadline: '2026-06-29',
        status: 'closingSoon',
        rfpScore: 86,
        recommendedPeople: 8
      },
      {
        id: 'job-003',
        noticeNumber: 'BID-2026-0129',
        title: '스마트 민원 통합관리 시스템 구축',
        agency: '서울특별시',
        category: '업무시스템',
        budget: 560000000,
        publishedAt: '2026-06-12',
        deadline: '2026-07-01',
        status: 'open',
        rfpScore: 81,
        recommendedPeople: 6
      },
      {
        id: 'job-004',
        noticeNumber: 'BID-2026-0117',
        title: 'AI 기반 계약 리스크 분석 PoC',
        agency: '한국지능정보사회진흥원',
        category: 'AI 분석',
        budget: 320000000,
        publishedAt: '2026-06-08',
        deadline: '2026-06-27',
        status: 'closingSoon',
        rfpScore: 90,
        recommendedPeople: 5
      },
      {
        id: 'job-005',
        noticeNumber: 'BID-2026-0104',
        title: '공급기업 성과관리 대시보드 구축',
        agency: '한국도로공사',
        category: '대시보드',
        budget: 430000000,
        publishedAt: '2026-06-02',
        deadline: '2026-07-10',
        status: 'open',
        rfpScore: 84,
        recommendedPeople: 9
      },
      {
        id: 'job-006',
        noticeNumber: 'BID-2026-0098',
        title: '통합 입찰 이력 관리 시스템 운영',
        agency: '국토교통부',
        category: '운영/유지보수',
        budget: 910000000,
        publishedAt: '2026-05-24',
        deadline: '2026-06-20',
        status: 'awarded',
        rfpScore: 79,
        recommendedPeople: 4
      }
    ]
  },
  error: null
};

export const mockJobDetailResponse: ApiResponse<JobDetail> = {
  success: true,
  data: {
    ...mockJobsResponse.data.items[0],
    description: 'RFP 분석, 인력 매칭, 제안 준비 현황을 통합 관리하는 입찰 공고입니다.',
    requirements: ['전자조달 도메인 경험', 'React 기반 대시보드 구축', 'PostgreSQL 운영 경험'],
    evaluationCriteria: {
      score: 84,
      summary: '전자조달 업무 이해도와 React 기반 대시보드 구축 경험을 중심으로 평가합니다.',
      requirements: [
        {
          type: 'domain',
          title: '전자조달 도메인 경험',
          description: '입찰 공고, 제안 접수, 평가 프로세스에 대한 이해',
          priority: 1
        },
        {
          type: 'technical',
          title: 'React 기반 대시보드 구축',
          description: '운영자가 반복적으로 확인하는 정보 구조와 목록 UX 구성',
          priority: 2
        },
        {
          type: 'operation',
          title: 'PostgreSQL 운영 경험',
          description: '입찰/제안/계약 데이터를 안정적으로 관리할 수 있는 DB 운영 역량',
          priority: 3
        }
      ],
      requiredSkills: ['React', 'PostgreSQL'],
      preferredSkills: ['조달 도메인', 'RFP 분석'],
      risks: ['제안 마감 전 제출 문서 검증 필요'],
      keywords: ['전자조달', '대시보드', 'RFP']
    }
  },
  error: null
};
