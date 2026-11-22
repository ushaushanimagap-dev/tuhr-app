# Xcode loyihasidagi "App" nishonini sozlash (xcodeproj — CocoaPods bilan birga o'rnatilgan).
# Ishlatish: ruby configure.rb ios/App/App.xcodeproj <version> <build> [team_id]
require 'xcodeproj'

proj_path, version, build, team = ARGV
abort 'usage: configure.rb <xcodeproj> <version> <build> [team]' unless proj_path && version && build

project = Xcodeproj::Project.open(proj_path)
target = project.targets.find { |t| t.name == 'App' } or abort '"App" nishoni topilmadi'

target.build_configurations.each do |c|
  s = c.build_settings
  s['PRODUCT_BUNDLE_IDENTIFIER'] = 'uz.tuhr.app'
  s['MARKETING_VERSION'] = version
  s['CURRENT_PROJECT_VERSION'] = build
  s['TARGETED_DEVICE_FAMILY'] = '1'          # faqat iPhone (iPad skrinshotlari talab qilinmaydi)
  s['CODE_SIGN_STYLE'] = 'Automatic'
  s['DEVELOPMENT_TEAM'] = team if team && !team.empty?
end

# Maxfiylik manifesti (PrivacyInfo.xcprivacy) — ilova resurslariga qo'shiladi.
unless target.resources_build_phase.files_references.any? { |r| r && r.path.to_s.end_with?('PrivacyInfo.xcprivacy') }
  group = project.main_group.children.find { |g| g.respond_to?(:path) && g.path == 'App' && g.isa == 'PBXGroup' } or abort '"App" guruhi topilmadi'
  ref = group.new_reference('PrivacyInfo.xcprivacy')
  target.add_resources([ref])
end

project.save
target.build_configurations.each do |c|
  s = c.build_settings
  puts "#{c.name}: #{s['PRODUCT_BUNDLE_IDENTIFIER']} #{s['MARKETING_VERSION']} (#{s['CURRENT_PROJECT_VERSION']}) family=#{s['TARGETED_DEVICE_FAMILY']} team=#{s['DEVELOPMENT_TEAM'] || '-'}"
end
